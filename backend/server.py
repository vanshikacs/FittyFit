from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Literal, Dict, Any
from datetime import datetime, timezone, timedelta
from pathlib import Path
import os
import uuid
import json
import re
import logging
import bcrypt
import jwt as pyjwt
import certifi

from groq import Groq

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

# ---------------- Config ----------------
MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]
GROQ_API_KEY = os.environ["GROQ_API_KEY"]
JWT_SECRET = os.environ.get("JWT_SECRET", "dev-secret")
JWT_ALGO = "HS256"
JWT_EXPIRY_DAYS = 14

TEXT_MODEL = "llama-3.3-70b-versatile"
VISION_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct"  # Groq vision-capable model
MAX_HISTORY_MESSAGES = 20  # cap conversation history sent per coach chat call

client = AsyncIOMotorClient(MONGO_URL, tlsCAFile=certifi.where())
db = client[DB_NAME]

# Single reused Groq client (do not recreate per-request)
groq_client = Groq(api_key=GROQ_API_KEY)

app = FastAPI(title="Fittyfit API")
api = APIRouter(prefix="/api")
bearer = HTTPBearer(auto_error=False)

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")
logger = logging.getLogger("fittyfit")


# ---------------- Models ----------------
Role = Literal["elder", "caregiver"]


class SignupIn(BaseModel):
    full_name: str
    email: EmailStr
    phone: str
    password: str
    role: Role = "elder"


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class TokenOut(BaseModel):
    token: str
    user: dict


class HealthProfile(BaseModel):
    age: Optional[int] = None
    gender: Optional[str] = None
    city: Optional[str] = None
    language: Optional[str] = "English"
    blood_group: Optional[str] = None
    chronic_conditions: List[str] = []
    allergies: List[str] = []
    dietary_restrictions: List[str] = []
    current_medications: List[str] = []
    emergency_contact: Optional[str] = None
    caregiver_contact: Optional[str] = None
    enable_voice_call: bool = True
    preferred_call_time: Optional[str] = "08:00"
    enable_seasonal: bool = True
    enable_cultural: bool = True


class MedicationIn(BaseModel):
    name: str
    dosage: str
    time: str  # "HH:MM"
    frequency: str = "Daily"
    notes: Optional[str] = None


class MedLogIn(BaseModel):
    medication_id: str
    status: Literal["taken", "missed"]


class ChatIn(BaseModel):
    message: str
    session_id: Optional[str] = None


class FoodAnalyzeIn(BaseModel):
    image_base64: Optional[str] = None
    food_name: Optional[str] = None


class SOSIn(BaseModel):
    location: Optional[str] = None
    note: Optional[str] = None


# ---------------- Auth Helpers ----------------
def hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode(), bcrypt.gensalt()).decode()


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode(), hashed.encode())
    except Exception:
        return False


def create_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(days=JWT_EXPIRY_DAYS),
        "iat": datetime.now(timezone.utc),
    }
    return pyjwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)


async def get_current_user(creds: Optional[HTTPAuthorizationCredentials] = Depends(bearer)):
    if not creds:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = pyjwt.decode(creds.credentials, JWT_SECRET, algorithms=[JWT_ALGO])
        user_id = payload["sub"]
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = await db.users.find_one({"id": user_id}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


def public_user(user: dict) -> dict:
    return {
        "id": user["id"],
        "full_name": user["full_name"],
        "email": user["email"],
        "phone": user["phone"],
        "role": user["role"],
        "profile": user.get("profile", {}),
        "onboarded": user.get("onboarded", False),
        "created_at": user.get("created_at"),
    }


# ---------------- Groq Helpers ----------------
def _safe_error_message(e: Exception) -> str:
    """Return a short, safe error string. Never leak stack traces, keys, or tokens."""
    msg = str(e)
    # strip anything that looks like it could be a key/token
    msg = re.sub(r"(sk|gsk)_[A-Za-z0-9]+", "[redacted]", msg)
    return msg[:200]


async def groq_text_completion(
    system_message: str,
    history: List[Dict[str, str]],
    user_message: str,
    temperature: float = 0.6,
    max_tokens: int = 600,
) -> str:
    """
    Run a Groq chat completion for text-only prompts.
    `history` is a list of {"role": "user"|"assistant", "content": str} in chronological order.
    """
    messages = [{"role": "system", "content": system_message}]
    messages.extend(history[-MAX_HISTORY_MESSAGES:])
    messages.append({"role": "user", "content": user_message})

    completion = groq_client.chat.completions.create(
        model=TEXT_MODEL,
        messages=messages,
        temperature=temperature,
        max_tokens=max_tokens,
    )
    return completion.choices[0].message.content.strip()


async def groq_vision_completion(
    system_message: str,
    user_text: str,
    image_base64: str,
    temperature: float = 0.4,
    max_tokens: int = 500,
) -> str:
    """Run a Groq vision-capable chat completion with an inline base64 image."""
    image_url = f"data:image/jpeg;base64,{image_base64}"
    completion = groq_client.chat.completions.create(
        model=VISION_MODEL,
        messages=[
            {"role": "system", "content": system_message},
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": user_text},
                    {"type": "image_url", "image_url": {"url": image_url}},
                ],
            },
        ],
        temperature=temperature,
        max_tokens=max_tokens,
    )
    return completion.choices[0].message.content.strip()


def _extract_braced_json(raw_text: str) -> Optional[str]:
    """Extract the first complete {...} JSON object via brace matching."""
    txt = raw_text.strip()
    txt = re.sub(r"^```(?:json)?\s*", "", txt)
    txt = re.sub(r"\s*```$", "", txt)

    start = txt.find("{")
    if start == -1:
        return None

    depth = 0
    in_string = False
    escape = False

    for i in range(start, len(txt)):
        ch = txt[i]
        if in_string:
            if escape:
                escape = False
            elif ch == "\\":
                escape = True
            elif ch == '"':
                in_string = False
            continue

        if ch == '"':
            in_string = True
            continue
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                # slice spaces preserved for valid json formatting
                return txt[start : i + 1]

    return None


def extract_json_object(raw_text: str) -> Optional[dict]:
    """Pull the first {...} JSON object out of a raw LLM response, tolerating extra prose."""
    # Fast path: brace matching (more reliable than greedy regex)
    candidate = _extract_braced_json(raw_text)
    if candidate:
        try:
            return json.loads(candidate)
        except Exception:
            pass

    # Fallback: original greedy regex approach
    txt = raw_text.strip()
    txt = re.sub(r"^```(?:json)?\s*", "", txt)
    txt = re.sub(r"\s*```$", "", txt)
    m = re.search(r"\{.*\}", txt, re.DOTALL)
    if m:
        txt = m.group(0)
        try:
            return json.loads(txt)
        except Exception:
            return None

    return None


def _normalize_food_analysis(
    data: Optional[dict],
    default_food_name: str,
    fallback_raw_reply: Optional[str] = None,
) -> dict:
    """Ensure the response always matches the frontend contract."""

    normalized = {
        "food_name": default_food_name or "Unknown",
        "verdict": "limit",
        "reason": "",
        "medicine_interaction": "",
        "seasonal_note": "",
        "alternatives": [],
    }

    if not isinstance(data, dict):
        # Include some of the raw reply for debugging/user context.
        raw = (fallback_raw_reply or "").strip()
        normalized["reason"] = (raw[:200] if raw else "Unable to analyze right now.")
        return normalized

    # food_name
    if isinstance(data.get("food_name"), str) and data.get("food_name").strip():
        normalized["food_name"] = data["food_name"].strip()

    # verdict
    verdict = data.get("verdict")
    if verdict in ("safe", "limit", "avoid"):
        normalized["verdict"] = verdict

    # text fields
    for k in ("reason", "medicine_interaction", "seasonal_note"):
        v = data.get(k)
        if isinstance(v, str):
            normalized[k] = v.strip()

    # Cap reason to ~30 words (LLM might violate)
    if normalized["reason"]:
        words = normalized["reason"].split()
        normalized["reason"] = " ".join(words[:30]).strip()

    # alternatives: must be [str,str,str]
    alts = data.get("alternatives")
    indian_defaults = ["Curd rice", "Vegetable khichdi", "Moong dal chilla"]
    if isinstance(alts, list):
        cleaned = [a.strip() for a in alts if isinstance(a, str) and a.strip()]
        cleaned = cleaned[:3]
        # pad if fewer than 3
        while len(cleaned) < 3:
            cleaned.append(indian_defaults[len(cleaned) % len(indian_defaults)])
        normalized["alternatives"] = cleaned

    return normalized


# ---------------- Routes ----------------
@api.get("/")
async def root():
    return {"service": "Fittyfit API", "status": "ok"}


@api.post("/auth/signup", response_model=TokenOut)
async def signup(inp: SignupIn):
    existing = await db.users.find_one({"email": inp.email.lower()})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user_id = str(uuid.uuid4())
    doc = {
        "id": user_id,
        "full_name": inp.full_name,
        "email": inp.email.lower(),
        "phone": inp.phone,
        "role": inp.role,
        "password_hash": hash_password(inp.password),
        "profile": {},
        "onboarded": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.users.insert_one(doc)
    token = create_token(user_id)
    return {"token": token, "user": public_user(doc)}


@api.post("/auth/login", response_model=TokenOut)
async def login(inp: LoginIn):
    user = await db.users.find_one({"email": inp.email.lower()})
    if not user or not verify_password(inp.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_token(user["id"])
    return {"token": token, "user": public_user(user)}


@api.get("/auth/me")
async def me(user=Depends(get_current_user)):
    return public_user(user)


@api.put("/profile")
async def update_profile(profile: HealthProfile, user=Depends(get_current_user)):
    await db.users.update_one(
        {"id": user["id"]},
        {"$set": {"profile": profile.model_dump(), "onboarded": True}},
    )
    updated = await db.users.find_one({"id": user["id"]}, {"_id": 0, "password_hash": 0})
    return public_user(updated)


# ---------------- Medications ----------------
@api.get("/medications")
async def list_meds(user=Depends(get_current_user)):
    meds = await db.medications.find({"user_id": user["id"]}, {"_id": 0}).to_list(200)
    since = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()
    logs = await db.med_logs.find(
        {"user_id": user["id"], "created_at": {"$gte": since}}, {"_id": 0}
    ).to_list(1000)
    taken = sum(1 for l in logs if l["status"] == "taken")
    total = max(len(logs), 1)
    adherence = round((taken / total) * 100) if logs else 100
    return {"medications": meds, "adherence": adherence, "logs": logs}


@api.post("/medications")
async def add_med(inp: MedicationIn, user=Depends(get_current_user)):
    med = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        **inp.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.medications.insert_one(med)
    return {k: v for k, v in med.items() if k != "_id"}


@api.delete("/medications/{med_id}")
async def delete_med(med_id: str, user=Depends(get_current_user)):
    await db.medications.delete_one({"id": med_id, "user_id": user["id"]})
    return {"ok": True}


@api.post("/medications/log")
async def log_med(inp: MedLogIn, user=Depends(get_current_user)):
    log = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "medication_id": inp.medication_id,
        "status": inp.status,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.med_logs.insert_one(log)
    if inp.status == "missed":
        med = await db.medications.find_one({"id": inp.medication_id}, {"_id": 0})
        await db.alerts.insert_one({
            "id": str(uuid.uuid4()),
            "user_id": user["id"],
            "type": "missed_medication",
            "priority": "high",
            "title": "Missed medication",
            "message": f"{user['full_name']} missed {med['name'] if med else 'a medication'}.",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "read": False,
        })
    return {k: v for k, v in log.items() if k != "_id"}


# ---------------- AI Coach ----------------
def _coach_system(user: dict) -> str:
    p = user.get("profile", {}) or {}
    conditions = ", ".join(p.get("chronic_conditions", [])) or "none reported"
    allergies = ", ".join(p.get("allergies", [])) or "none"
    meds = ", ".join(p.get("current_medications", [])) or "none"
    lang = p.get("language", "English")
    return (
        f"You are Fittyfit, a warm, respectful, India-first AI Health Coach for elderly users and caregivers. "
        f"User: {user['full_name']} (role: {user['role']}). "
        f"Chronic conditions: {conditions}. Allergies: {allergies}. Current medications: {meds}. "
        f"Preferred language: {lang}. "
        f"Always answer in 3-6 short sentences. Use calm, caring, simple words. "
        f"When giving food/medicine advice, mention caution if unsafe and suggest a safer alternative. "
        f"If a symptom sounds serious (chest pain, breathlessness, fainting), recommend calling emergency or caregiver. "
        f"Add gentle Indian context when relevant (seasonal, cultural, regional foods)."
    )


@api.post("/coach/chat")
async def coach_chat(inp: ChatIn, user=Depends(get_current_user)):
    session_id = inp.session_id or str(uuid.uuid4())

    # Rebuild conversation history from stored messages for this session,
    # so context/memory/personalization persists exactly as before.
    prior = await db.coach_messages.find(
        {"user_id": user["id"], "session_id": session_id}, {"_id": 0}
    ).sort("created_at", 1).to_list(200)

    history: List[Dict[str, str]] = []
    for m in prior:
        history.append({"role": "user", "content": m["user_message"]})
        history.append({"role": "assistant", "content": m["ai_response"]})

    try:
        reply = await groq_text_completion(
            system_message=_coach_system(user),
            history=history,
            user_message=inp.message,
        )
    except Exception as e:
        logger.exception("coach chat failed")
        raise HTTPException(status_code=500, detail=f"AI error: {_safe_error_message(e)}")

    msg_doc = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "session_id": session_id,
        "user_message": inp.message,
        "ai_response": reply,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.coach_messages.insert_one(msg_doc)
    return {"session_id": session_id, "reply": reply}


@api.get("/coach/history")
async def coach_history(user=Depends(get_current_user)):
    msgs = await db.coach_messages.find(
        {"user_id": user["id"]}, {"_id": 0}
    ).sort("created_at", -1).to_list(50)
    return msgs


# ---------------- Food Analysis ----------------
def _food_system(user: dict) -> str:
    p = user.get("profile", {}) or {}
    conditions = ", ".join(p.get("chronic_conditions", [])) or "none"
    meds = ", ".join(p.get("current_medications", [])) or "none"
    allergies = ", ".join(p.get("allergies", [])) or "none"
    return (
        f"You are Fittyfit Food Analyzer for an Indian elderly user with conditions: {conditions}, "
        f"medications: {meds}, allergies: {allergies}. "
        f"Analyze the food item (from image or name). Respond ONLY in strict JSON with keys: "
        f'{{"food_name": str, "verdict": "safe"|"limit"|"avoid", "reason": str, '
        f'"medicine_interaction": str, "seasonal_note": str, "alternatives": [str, str, str]}}. '
        f"Keep reason under 30 words. Alternatives must be Indian foods."
    )


@api.post("/food/analyze")
async def food_analyze(inp: FoodAnalyzeIn, user=Depends(get_current_user)):
    if not inp.image_base64 and not inp.food_name:
        raise HTTPException(status_code=400, detail="Provide image or food_name")

    try:
        if inp.image_base64:
            clean = inp.image_base64.split(",", 1)[1] if "," in inp.image_base64 else inp.image_base64
            reply = await groq_vision_completion(
                system_message=_food_system(user),
                user_text="Analyze this meal and return strict JSON only.",
                image_base64=clean,
            )
        else:
            reply = await groq_text_completion(
                system_message=_food_system(user),
                history=[],
                user_message=f"Food item: {inp.food_name}. Return strict JSON only.",
            )
    except Exception as e:
        logger.exception("food analyze failed")
        raise HTTPException(status_code=500, detail=f"AI error: {_safe_error_message(e)}")

    raw_data = extract_json_object(reply)
    normalized = _normalize_food_analysis(
        raw_data,
        default_food_name=inp.food_name or "Unknown",
        fallback_raw_reply=reply,
    )

    record = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "result": normalized,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.food_logs.insert_one(record)

    if normalized.get("verdict") == "avoid":
        await db.alerts.insert_one({
            "id": str(uuid.uuid4()),
            "user_id": user["id"],
            "type": "risky_food",
            "priority": "medium",
            "title": "Risky food choice",
            "message": f"{user['full_name']} scanned '{normalized.get('food_name')}' flagged as avoid.",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "read": False,
        })
    return normalized


# ---------------- Voice Summary ----------------
@api.get("/voice/summary")
async def voice_summary(user=Depends(get_current_user)):
    p = user.get("profile", {}) or {}
    lang = p.get("language", "English")
    meds = await db.medications.find({"user_id": user["id"]}, {"_id": 0}).to_list(20)
    med_names = [m["name"] for m in meds][:3]

    system_message = (
        f"You write a warm, elder-friendly daily health voice summary for an Indian user in {lang}. "
        f"4-5 short sentences. Include greeting with their name, medicine reminder, seasonal hydration/weather tip, "
        f"a cultural/food note, and a caring closing line. If language is Hindi, use Roman Hindi (Hinglish)."
    )
    prompt = (
        f"User: {user['full_name']}. Medicines today: {', '.join(med_names) or 'none logged'}. "
        f"Conditions: {', '.join(p.get('chronic_conditions', [])) or 'none'}. "
        f"Write today's summary now."
    )

    try:
        reply = await groq_text_completion(
            system_message=system_message,
            history=[],
            user_message=prompt,
        )
    except Exception as e:
        reply = (
            f"Namaste {user['full_name']} ji, aaj aapki dawaai lena na bhoolein. "
            f"Paani zyada piyen, halki walk karein, aur khana samay par khayen. Khayal rakhein."
        )
        logger.exception("voice summary error: %s", _safe_error_message(e))

    return {"language": lang, "summary": reply, "date": datetime.now(timezone.utc).date().isoformat()}


# ---------------- Alerts ----------------
@api.get("/alerts")
async def list_alerts(user=Depends(get_current_user)):
    alerts = await db.alerts.find(
        {"user_id": user["id"]}, {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    return alerts


@api.post("/alerts/{alert_id}/read")
async def mark_alert_read(alert_id: str, user=Depends(get_current_user)):
    await db.alerts.update_one(
        {"id": alert_id, "user_id": user["id"]}, {"$set": {"read": True}}
    )
    return {"ok": True}


# ---------------- SOS ----------------
@api.post("/sos")
async def trigger_sos(inp: SOSIn, user=Depends(get_current_user)):
    event = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "location": inp.location,
        "note": inp.note,
        "status": "sent",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.sos_events.insert_one(event)
    await db.alerts.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "type": "sos",
        "priority": "critical",
        "title": "SOS Emergency Triggered",
        "message": f"{user['full_name']} triggered SOS. Location: {inp.location or 'unknown'}.",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "read": False,
    })
    return {k: v for k, v in event.items() if k != "_id"}


@api.get("/sos/history")
async def sos_history(user=Depends(get_current_user)):
    events = await db.sos_events.find(
        {"user_id": user["id"]}, {"_id": 0}
    ).sort("created_at", -1).to_list(50)
    return events


# ---------------- Dashboard summary ----------------
@api.get("/dashboard")
async def dashboard(user=Depends(get_current_user)):
    meds = await db.medications.find({"user_id": user["id"]}, {"_id": 0}).to_list(50)
    alerts = await db.alerts.find(
        {"user_id": user["id"], "read": False}, {"_id": 0}
    ).sort("created_at", -1).to_list(10)
    since = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()
    logs = await db.med_logs.find(
        {"user_id": user["id"], "created_at": {"$gte": since}}, {"_id": 0}
    ).to_list(1000)
    taken = sum(1 for l in logs if l["status"] == "taken")
    adherence = round((taken / max(len(logs), 1)) * 100) if logs else 100
    return {
        "user": public_user(user),
        "medications": meds,
        "unread_alerts": alerts,
        "adherence": adherence,
    }


app.include_router(api)

cors_env = os.environ.get(
    "CORS_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001"
)
origins = [origin.strip() for origin in cors_env.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()