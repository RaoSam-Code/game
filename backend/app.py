import os
import json
import uuid
from contextlib import asynccontextmanager

import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel

from story_generator import generate_story
from character_brain import build_system_prompt, get_all_prompts
from mood_engine import MoodEngine

# --- Config ---
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")

# --- In-memory game sessions ---
sessions = {}  # session_id -> { story, prompts, conversations, mood_engine }


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🕵️ Midnight at Blackwood Manor — Backend starting...")
    print(f"   GROQ_API_KEY: {'✅ configured' if GROQ_API_KEY else '❌ missing!'}")
    yield
    print("🔒 Backend shutting down.")


app = FastAPI(
    title="Midnight at Blackwood Manor",
    description="AI-Powered Detective Game Backend",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Models ---
class NewGameRequest(BaseModel):
    difficulty: str = "normal"


class ChatRequest(BaseModel):
    session_id: str
    suspect_id: str
    message: str


class HintRequest(BaseModel):
    session_id: str


class AccuseRequest(BaseModel):
    session_id: str
    suspect_id: str


# --- Endpoints ---
@app.get("/api/health")
async def health():
    return {"status": "ok", "api_key_configured": bool(GROQ_API_KEY)}


@app.post("/api/new-game")
async def new_game(req: NewGameRequest):
    """Generate a new procedural mystery and return game data."""
    if not GROQ_API_KEY:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY not configured")

    try:
        story = await generate_story(req.difficulty)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Story generation failed: {str(e)}")

    session_id = str(uuid.uuid4())
    prompts = get_all_prompts(story, req.difficulty)

    sessions[session_id] = {
        "story": story,
        "prompts": prompts,
        "conversations": {},  # suspect_id -> [messages]
        "mood_engine": MoodEngine(),
    }

    # Return story WITHOUT secrets/is_killer/system prompts
    safe_story = _sanitize_story(story)

    return {
        "session_id": session_id,
        "story": safe_story,
    }


@app.post("/api/chat")
async def chat(req: ChatRequest):
    """Send a message to a suspect and get their AI response."""
    session = sessions.get(req.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found. Start a new game.")

    story = session["story"]
    suspect = next((s for s in story["suspects"] if s["id"] == req.suspect_id), None)
    if not suspect:
        raise HTTPException(status_code=400, detail="Unknown suspect ID")

    system_prompt = session["prompts"][req.suspect_id]

    # Get or create conversation history
    if req.suspect_id not in session["conversations"]:
        session["conversations"][req.suspect_id] = []

    conversation = session["conversations"][req.suspect_id]
    conversation.append({"role": "user", "content": req.message})

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                GROQ_API_URL,
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {GROQ_API_KEY}",
                },
                json={
                    "model": "llama-3.3-70b-versatile",
                    "max_tokens": 300,
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        *conversation,
                    ],
                },
            )
            response.raise_for_status()
            data = response.json()
            ai_response = data["choices"][0]["message"]["content"]
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=502, detail=f"AI API error: {e.response.status_code}")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI API error: {str(e)}")

    # Save AI response
    conversation.append({"role": "assistant", "content": ai_response})

    # Analyze mood
    mood_data = session["mood_engine"].analyze(req.suspect_id, ai_response)

    # Detect evidence keywords
    evidence = _detect_evidence(req.message, ai_response, suspect["name"])

    return {
        "response": ai_response,
        "mood": mood_data,
        "evidence": evidence,
        "question_count": len([m for m in conversation if m["role"] == "user"]),
    }


@app.post("/api/hint")
async def get_hint(req: HintRequest):
    """Get a contextual hint based on current game state."""
    session = sessions.get(req.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    story = session["story"]
    conversations = session["conversations"]
    mood_engine = session["mood_engine"]

    total_questions = sum(
        len([m for m in msgs if m["role"] == "user"])
        for msgs in conversations.values()
    )

    # Find killer and witness
    killer = next(s for s in story["suspects"] if s.get("is_killer"))
    witness = next((s for s in story["suspects"] if s.get("is_witness")), None)

    # Check if player has talked to witness
    witness_questioned = (
        witness and
        witness["id"] in conversations and
        len([m for m in conversations[witness["id"]] if m["role"] == "user"]) > 0
    )

    # Check if player has questioned killer
    killer_questioned = (
        killer["id"] in conversations and
        len([m for m in conversations[killer["id"]] if m["role"] == "user"]) > 0
    )

    # Check tension levels
    killer_tension = mood_engine.get_tension(killer["id"])

    murder = story["murder"]

    if total_questions < 2:
        if witness:
            hint = f"Start by talking to {witness['name']} — as the {witness['relationship']}, they may have seen something important."
        else:
            hint = "Start questioning each suspect about their whereabouts during the time of the murder."
        priority = "low"
    elif not witness_questioned and witness:
        hint = f"Don't forget to question {witness['name']}. People in their position often notice things others miss."
        priority = "medium"
    elif not killer_questioned:
        hint = f"You haven't questioned {killer['name']} yet. Every suspect deserves scrutiny."
        priority = "medium"
    elif killer_tension > 0.5:
        hint = f"One of the suspects seems increasingly nervous. Press them harder on contradictions in their story."
        priority = "high"
    else:
        hint = f"Ask suspects specifically about the time around {murder['time']}. Those critical minutes matter the most."
        priority = "medium"

    return {"hint": hint, "priority": priority}


@app.post("/api/accuse")
async def accuse(req: AccuseRequest):
    """Make a final accusation."""
    session = sessions.get(req.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    story = session["story"]
    suspect = next((s for s in story["suspects"] if s["id"] == req.suspect_id), None)
    if not suspect:
        raise HTTPException(status_code=400, detail="Unknown suspect ID")

    killer = next(s for s in story["suspects"] if s.get("is_killer"))
    correct = suspect.get("is_killer", False)

    # Build result
    result = {
        "correct": correct,
        "accused": {
            "name": suspect["name"],
            "is_killer": suspect.get("is_killer", False),
        },
        "killer": {
            "name": killer["name"],
            "motive": killer["motive"],
            "method": story["murder"]["method"],
            "alibi_was_false": not killer.get("alibi_is_true", True),
        },
    }

    # Add witness info if available
    witness = next((s for s in story["suspects"] if s.get("is_witness")), None)
    if witness:
        result["key_evidence"] = witness.get("witness_saw", "")

    # Clean up session
    if req.session_id in sessions:
        del sessions[req.session_id]

    return result


# --- Helpers ---
EVIDENCE_KEYWORDS = {
    "affair": {"label": "Affair discovered", "icon": "💔"},
    "divorce": {"label": "Divorce papers", "icon": "📄"},
    "inherit": {"label": "Inheritance motive", "icon": "💰"},
    "will": {"label": "Will mentioned", "icon": "📜"},
    "blackmail": {"label": "Blackmail scheme", "icon": "🔒"},
    "falsif": {"label": "Falsified records", "icon": "📋"},
    "fraud": {"label": "Fraud discovered", "icon": "🏦"},
    "poison": {"label": "Poison discussed", "icon": "🧪"},
    "cyanide": {"label": "Cyanide knowledge", "icon": "☠️"},
    "arsenic": {"label": "Arsenic mentioned", "icon": "☠️"},
    "murder weapon": {"label": "Murder weapon discussed", "icon": "🗡️"},
    "alibi": {"label": "Alibi provided", "icon": "🕐"},
    "study": {"label": "Study access", "icon": "🚪"},
    "garden": {"label": "Garden mentioned", "icon": "🌿"},
    "balcony": {"label": "Balcony mentioned", "icon": "🏛️"},
    "saw": {"label": "Witness testimony", "icon": "👁️"},
    "witness": {"label": "Witness mentioned", "icon": "👁️"},
    "nervous": {"label": "Nervousness detected", "icon": "😰"},
    "lying": {"label": "Deception suspected", "icon": "🤥"},
    "threatening": {"label": "Threats mentioned", "icon": "⚠️"},
    "debt": {"label": "Financial motive", "icon": "💳"},
    "revenge": {"label": "Revenge motive", "icon": "🔥"},
    "jealous": {"label": "Jealousy motive", "icon": "💚"},
    "secret": {"label": "Secret revealed", "icon": "🤫"},
    "knife": {"label": "Knife mentioned", "icon": "🔪"},
    "blood": {"label": "Blood evidence", "icon": "🩸"},
    "fingerprint": {"label": "Fingerprints", "icon": "🔎"},
}


def _detect_evidence(question, response, suspect_name):
    """Detect evidence from conversation."""
    combined = (question + " " + response).lower()
    found = []
    for keyword, data in EVIDENCE_KEYWORDS.items():
        if keyword in combined:
            found.append({
                "suspect": suspect_name,
                "label": data["label"],
                "icon": data["icon"],
            })
    return found


def _sanitize_story(story):
    """Remove sensitive info before sending to frontend."""
    safe = {
        "victim": story["victim"],
        "setting": story["setting"],
        "murder": {
            "method": story["murder"]["method"],
            "time": story["murder"]["time"],
            "location_detail": story["murder"]["location_detail"],
        },
        "timeline": story.get("timeline", ""),
        "suspects": [],
    }
    for s in story["suspects"]:
        safe["suspects"].append({
            "id": s["id"],
            "name": s["name"],
            "age": s["age"],
            "profession": s["profession"],
            "relationship": s["relationship"],
            "personality": s["personality"],
            "color": s["color"],
            "emoji": s["emoji"],
            "voice_params": s["voice_params"],
        })
    return safe


# --- Serve frontend static files ---
static_dir = os.path.join(os.path.dirname(__file__), "static")
if os.path.exists(static_dir):
    app.mount("/assets", StaticFiles(directory=os.path.join(static_dir, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        """Serve React frontend for all non-API routes."""
        file_path = os.path.join(static_dir, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(static_dir, "index.html"))
