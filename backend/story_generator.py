import json
import random
import httpx
import os

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")

SETTINGS = [
    "Blackwood Manor, a sprawling Victorian estate during a thunderstorm",
    "The Silver Serpent, a luxury yacht anchored off the coast at midnight",
    "Château de Verre, a remote French castle during a New Year's Eve masquerade",
    "The Pinnacle Club, an exclusive penthouse club on the 60th floor of a skyscraper",
    "Ravenscroft Academy, a prestigious boarding school during winter break",
    "The Orient Midnight, a vintage luxury train crossing the Alps",
    "Harrowmere Lighthouse, an isolated lighthouse on a storm-battered island",
    "The Gilded Cage, a private art gallery during an invitation-only auction",
]

MURDER_METHODS = [
    "poisoning (cyanide in a drink)",
    "poisoning (arsenic in food)",
    "poisoning (digitalis in medication)",
    "stabbing with an antique letter opener",
    "blunt force trauma (heavy bookend)",
    "strangulation with a silk scarf",
    "pushed from a balcony (staged as accident)",
    "suffocation with a pillow",
    "electrocution (rigged bathroom appliance)",
    "allergic reaction (deliberate exposure to known allergen)",
]

PROFESSIONS = [
    "Surgeon", "Lawyer", "Art Dealer", "Professor", "Journalist", "Chef",
    "Actress", "Politician", "Banker", "Architect", "Pharmacist", "Psychologist",
    "Socialite", "Business Tycoon", "Military Officer", "Private Investigator",
    "Antique Dealer", "Fashion Designer", "Music Conductor", "Diplomat",
]

FIRST_NAMES = [
    "Alexander", "Beatrice", "Charles", "Diana", "Edward", "Francesca",
    "Gabriel", "Helena", "Isaac", "Josephine", "Kenneth", "Lucinda",
    "Marcus", "Natasha", "Oliver", "Penelope", "Quentin", "Rosalind",
    "Sebastian", "Theodora", "Victor", "Vivienne", "William", "Yvette",
]

LAST_NAMES = [
    "Ashworth", "Blackwell", "Carrington", "Devereaux", "Eastwood",
    "Fairchild", "Graves", "Hawthorne", "Ivanova", "Kingsley",
    "Langford", "Montague", "Northcott", "Pemberton", "Ravencroft",
    "Sinclair", "Thornton", "Underwood", "Whitmore", "Zhao",
]

RELATIONSHIPS = [
    "spouse", "business partner", "personal physician", "housekeeper",
    "childhood friend", "financial advisor", "secretary", "rival",
    "ex-lover", "protégé", "sibling", "cousin", "neighbor",
    "old college roommate", "therapist", "bodyguard",
]

MOTIVES = [
    "inheritance — stands to gain a fortune from the will",
    "blackmail — victim was threatening to expose a dark secret",
    "revenge — victim destroyed their career/reputation years ago",
    "love triangle — passionate jealousy over a romantic rival",
    "debt — owed victim a massive sum, saw no other way out",
    "cover-up — victim was about to discover their criminal activities",
    "professional rivalry — victim was blocking their promotion/deal",
    "insurance fraud — victim's death triggers a massive payout",
    "self-defense (perceived) — believed victim was planning to kill them first",
    "ideological — believed victim was doing something deeply immoral",
]

SECRET_TYPES = [
    "having a secret affair",
    "embezzling money from their employer",
    "hiding a past crime (identity fraud)",
    "addicted to gambling with massive hidden debts",
    "secretly recording people for leverage",
    "lying about their professional qualifications",
    "in witness protection under a false identity",
    "planning to elope and disappear",
    "hiding a medical condition from everyone",
    "secretly working as an informant for police",
]


def _generate_random_time():
    """Generate a random murder time in the evening."""
    hour = random.choice([8, 9, 10, 11])
    minute = random.randint(0, 59)
    return f"{hour}:{minute:02d} PM"


def _generate_names(count):
    """Generate unique character names."""
    names = []
    used_first = set()
    used_last = set()
    for _ in range(count):
        first = random.choice([n for n in FIRST_NAMES if n not in used_first])
        last = random.choice([n for n in LAST_NAMES if n not in used_last])
        used_first.add(first)
        used_last.add(last)
        names.append(f"{first} {last}")
    return names


async def generate_story(difficulty="normal"):
    """Generate a complete procedural mystery using AI."""

    setting = random.choice(SETTINGS)
    method = random.choice(MURDER_METHODS)
    murder_time = _generate_random_time()

    # Generate 5 names: 1 victim + 4 suspects
    names = _generate_names(5)
    victim_name = names[0]
    suspect_names = names[1:]

    victim_age = random.randint(40, 70)
    victim_profession = random.choice(PROFESSIONS)

    # Pick killer
    killer_index = random.randint(0, 3)

    # Assign relationships, motives, secrets
    relationships = random.sample(RELATIONSHIPS, 4)
    all_motives = random.sample(MOTIVES, 4)
    secrets = random.sample(SECRET_TYPES, 4)

    # Key witness is always someone other than the killer
    witness_candidates = [i for i in range(4) if i != killer_index]
    witness_index = random.choice(witness_candidates)

    # Build suspect skeleton
    suspect_skeletons = []
    available_professions = [p for p in PROFESSIONS if p != victim_profession]
    suspect_professions = random.sample(available_professions, 4)

    for i in range(4):
        is_killer = i == killer_index
        is_witness = i == witness_index
        age = random.randint(25, 65)

        suspect_skeletons.append({
            "name": suspect_names[i],
            "age": age,
            "profession": suspect_professions[i],
            "relationship": relationships[i],
            "motive": all_motives[i],
            "secret": secrets[i],
            "is_killer": is_killer,
            "is_witness": is_witness,
        })

    # Use AI to flesh out the story
    generation_prompt = f"""You are a mystery story writer. Generate a complete murder mystery with these parameters:

SETTING: {setting}
VICTIM: {victim_name}, age {victim_age}, {victim_profession}
MURDER METHOD: {method}
TIME OF DEATH: {murder_time}

SUSPECTS:
{json.dumps(suspect_skeletons, indent=2)}

The killer is: {suspect_names[killer_index]}
The key witness is: {suspect_names[witness_index]} (they saw something that implicates the killer)

Generate a JSON response with this EXACT structure (no markdown, pure JSON):
{{
  "victim": {{
    "name": "{victim_name}",
    "age": {victim_age},
    "profession": "{victim_profession}",
    "description": "2-3 sentence description of the victim and why someone might want them dead"
  }},
  "setting": {{
    "name": "short location name",
    "description": "atmospheric 2-sentence description of the location"
  }},
  "murder": {{
    "method": "{method}",
    "time": "{murder_time}",
    "location_detail": "specific room/area within the setting where body was found"
  }},
  "timeline": "a paragraph describing the key events of the evening leading to the murder",
  "suspects": [
    {{
      "name": "full name",
      "age": number,
      "profession": "their job",
      "relationship": "relationship to victim",
      "personality": "3-4 personality traits that affect how they speak",
      "motive": "why they might want victim dead (1-2 sentences)",
      "secret": "what they are hiding (1-2 sentences)",
      "alibi": "where they claim to be at time of murder (1-2 sentences)",
      "alibi_is_true": true/false,
      "is_killer": true/false,
      "is_witness": true/false,
      "witness_saw": "if witness, what exactly they saw (null if not witness)",
      "key_evidence": "one piece of evidence that connects to this suspect",
      "deception_strategy": "how this suspect lies and deflects - specific techniques they use"
    }}
  ]
}}

Rules:
- Only the killer's alibi should be FALSE
- The witness must have seen something specific that places the killer near the crime scene around the time of murder
- Every suspect (even innocents) should have a believable motive and a secret that makes them look suspicious
- Each suspect needs a UNIQUE deception strategy (not just "deny everything")
- Make the killer's lies sophisticated — they should have a backup explanation ready
- The story should be internally consistent"""

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                GROQ_API_URL,
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {GROQ_API_KEY}",
                },
                json={
                    "model": "llama-3.3-70b-versatile",
                    "max_tokens": 3000,
                    "temperature": 0.9,
                    "messages": [
                        {"role": "system", "content": "You are a mystery story writer. Always respond with valid JSON only, no markdown formatting."},
                        {"role": "user", "content": generation_prompt},
                    ],
                },
            )
            response.raise_for_status()
            data = response.json()
            content = data["choices"][0]["message"]["content"]

            # Clean potential markdown wrapping
            content = content.strip()
            if content.startswith("```"):
                content = content.split("\n", 1)[1]
                if content.endswith("```"):
                    content = content[:-3]
                content = content.strip()

            story = json.loads(content)

            # Add emoji/color data for frontend
            colors = ["#c084fc", "#60a5fa", "#f87171", "#34d399"]
            emojis = ["👩‍💼", "🤵", "👩‍⚕️", "👵"]
            random.shuffle(emojis)

            for i, suspect in enumerate(story["suspects"]):
                suspect["id"] = f"suspect_{i}"
                suspect["color"] = colors[i]
                suspect["emoji"] = emojis[i]
                suspect["voice_params"] = {
                    "pitch": round(random.uniform(0.8, 1.2), 2),
                    "rate": round(random.uniform(0.8, 1.1), 2),
                }

            # Add difficulty metadata
            story["difficulty"] = difficulty

            return story

    except Exception as e:
        # Fallback: return a pre-built story if generation fails
        print(f"Story generation error: {e}")
        return _fallback_story()


def _fallback_story():
    """Emergency fallback story if AI generation fails."""
    return {
        "victim": {
            "name": "Richard Blackwood",
            "age": 55,
            "profession": "Business Tycoon",
            "description": "Wealthy industrialist known for ruthless business tactics. Made many enemies climbing to the top."
        },
        "setting": {
            "name": "Blackwood Manor",
            "description": "A sprawling Victorian estate shrouded in fog. Thunder rumbles in the distance as rain lashes the windows."
        },
        "murder": {
            "method": "poisoning (cyanide in a drink)",
            "time": "9:47 PM",
            "location_detail": "the private study"
        },
        "timeline": "The evening began with a dinner party at 7 PM. Guests mingled until 9 PM when Richard excused himself to the study. At 9:47 PM, the housekeeper found him dead at his desk, a half-empty brandy glass beside him.",
        "suspects": [
            {
                "id": "suspect_0", "name": "Victoria Blackwood", "age": 42, "profession": "Socialite",
                "relationship": "spouse", "personality": "Elegant, defensive, cracks under pressure, emotionally volatile",
                "motive": "inheritance — stands to gain the entire estate", "secret": "having a secret affair with James Sterling",
                "alibi": "In the dining room greeting guests from 9:30 to 10:00 PM", "alibi_is_true": True,
                "is_killer": False, "is_witness": False, "witness_saw": None,
                "key_evidence": "Divorce papers found in her bedroom drawer",
                "deception_strategy": "Becomes emotional and deflects by crying, redirects suspicion to others",
                "color": "#c084fc", "emoji": "👩‍💼", "voice_params": {"pitch": 1.1, "rate": 0.95}
            },
            {
                "id": "suspect_1", "name": "James Sterling", "age": 38, "profession": "Lawyer",
                "relationship": "business partner", "personality": "Charming, smooth-talking, hidden anger, calculating",
                "motive": "revenge — Richard forced him out of the company", "secret": "having a secret affair with Victoria",
                "alibi": "Playing cards in the library with three other guests", "alibi_is_true": True,
                "is_killer": False, "is_witness": False, "witness_saw": None,
                "key_evidence": "Angry emails threatening Richard found on his phone",
                "deception_strategy": "Uses charm and logical arguments, becomes aggressive only when cornered about business betrayal",
                "color": "#60a5fa", "emoji": "🤵", "voice_params": {"pitch": 0.9, "rate": 1.05}
            },
            {
                "id": "suspect_2", "name": "Dr. Eleanor Hayes", "age": 35, "profession": "Surgeon",
                "relationship": "personal physician", "personality": "Cold, clinical, overly calm, intelligent",
                "motive": "blackmail — Richard was threatening to expose falsified medical records",
                "secret": "hiding a medical condition from everyone",
                "alibi": "In the garden having a cigarette", "alibi_is_true": False,
                "is_killer": True, "is_witness": False, "witness_saw": None,
                "key_evidence": "Has medical knowledge and access to cyanide through her practice",
                "deception_strategy": "Maintains clinical composure, uses medical jargon to confuse, has a prepared backup story for being near the study",
                "color": "#f87171", "emoji": "👩‍⚕️", "voice_params": {"pitch": 1.0, "rate": 0.9}
            },
            {
                "id": "suspect_3", "name": "Margaret Chen", "age": 58, "profession": "Housekeeper",
                "relationship": "housekeeper", "personality": "Observant, honest, careful speaker, loyal",
                "motive": "debt — Richard refused to lend her money for her son's surgery",
                "secret": "secretly recording people for leverage",
                "alibi": "In the kitchen preparing dessert", "alibi_is_true": True,
                "is_killer": False, "is_witness": True,
                "witness_saw": "Saw Dr. Hayes entering the study at 9:45 PM, two minutes before the estimated time of death",
                "key_evidence": "Key witness who places the killer at the scene",
                "deception_strategy": "Genuinely helpful but cautious — won't volunteer information unless asked specifically",
                "color": "#34d399", "emoji": "👵", "voice_params": {"pitch": 1.05, "rate": 0.85}
            }
        ],
        "difficulty": "normal"
    }
