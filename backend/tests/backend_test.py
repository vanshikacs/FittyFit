"""Fittyfit backend API tests.
Covers: auth, profile, medications, coach, food, voice, alerts, sos, dashboard.
"""
import os
import io
import time
import base64
import uuid
import pytest
import requests
from PIL import Image

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    # fallback to reading frontend/.env
    with open("/app/frontend/.env") as f:
        for line in f:
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE_URL = line.split("=", 1)[1].strip().rstrip("/")
API = f"{BASE_URL}/api"

TEST_EMAIL = "demo.shanti@fittyfit.in"
TEST_PASSWORD = "Fittyfit@2026"


@pytest.fixture(scope="session")
def token():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    # try login first
    r = s.post(f"{API}/auth/login", json={"email": TEST_EMAIL, "password": TEST_PASSWORD}, timeout=30)
    if r.status_code == 200:
        return r.json()["token"]
    # else signup
    r = s.post(
        f"{API}/auth/signup",
        json={
            "full_name": "Shanti Devi",
            "email": TEST_EMAIL,
            "phone": "9876543210",
            "password": TEST_PASSWORD,
            "role": "elder",
        },
        timeout=30,
    )
    assert r.status_code == 200, f"signup failed: {r.status_code} {r.text}"
    return r.json()["token"]


@pytest.fixture
def client(token):
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json", "Authorization": f"Bearer {token}"})
    return s


# ---------- Root / Auth ----------
def test_root():
    r = requests.get(f"{API}/", timeout=15)
    assert r.status_code == 200
    assert r.json().get("status") == "ok"


def test_signup_duplicate_and_public_user_shape(token):
    # token fixture already ran signup/login. A duplicate signup must 400.
    r = requests.post(
        f"{API}/auth/signup",
        json={
            "full_name": "Dup",
            "email": TEST_EMAIL,
            "phone": "9876543210",
            "password": "xxxx",
            "role": "elder",
        },
        timeout=15,
    )
    assert r.status_code == 400


def test_me_with_token(client):
    r = client.get(f"{API}/auth/me", timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert data["email"] == TEST_EMAIL
    assert "password_hash" not in data
    assert "_id" not in data


def test_me_without_token():
    r = requests.get(f"{API}/auth/me", timeout=15)
    assert r.status_code == 401


def test_me_invalid_token():
    r = requests.get(f"{API}/auth/me", headers={"Authorization": "Bearer garbage"}, timeout=15)
    assert r.status_code == 401


def test_login_invalid():
    r = requests.post(f"{API}/auth/login", json={"email": TEST_EMAIL, "password": "WRONG"}, timeout=15)
    assert r.status_code == 401


# ---------- Profile ----------
def test_update_profile_sets_onboarded(client):
    profile = {
        "age": 68,
        "gender": "female",
        "city": "Jaipur",
        "language": "Hindi",
        "blood_group": "B+",
        "chronic_conditions": ["diabetes", "hypertension"],
        "allergies": ["peanuts"],
        "dietary_restrictions": ["vegetarian"],
        "current_medications": ["Metformin"],
        "emergency_contact": "9000011111",
        "caregiver_contact": "9000022222",
        "enable_voice_call": True,
        "preferred_call_time": "08:00",
        "enable_seasonal": True,
        "enable_cultural": True,
    }
    r = client.put(f"{API}/profile", json=profile, timeout=20)
    assert r.status_code == 200, r.text
    d = r.json()
    assert d["onboarded"] is True
    assert d["profile"]["city"] == "Jaipur"
    # verify via GET /me
    me = client.get(f"{API}/auth/me", timeout=15).json()
    assert me["onboarded"] is True
    assert me["profile"]["chronic_conditions"] == ["diabetes", "hypertension"]


# ---------- Medications ----------
def test_medications_crud_and_missed_creates_alert(client):
    # create
    r = client.post(
        f"{API}/medications",
        json={"name": "TEST_Metformin", "dosage": "500mg", "time": "08:00", "frequency": "Daily"},
        timeout=15,
    )
    assert r.status_code == 200, r.text
    med = r.json()
    assert med["name"] == "TEST_Metformin"
    med_id = med["id"]

    # list
    r = client.get(f"{API}/medications", timeout=15)
    assert r.status_code == 200
    listing = r.json()
    assert any(m["id"] == med_id for m in listing["medications"])
    assert "adherence" in listing

    # log missed -> alert created
    r = client.post(f"{API}/medications/log", json={"medication_id": med_id, "status": "missed"}, timeout=15)
    assert r.status_code == 200

    r = client.get(f"{API}/alerts", timeout=15)
    assert r.status_code == 200
    alerts = r.json()
    assert any(a["type"] == "missed_medication" for a in alerts), "missed_medication alert not created"

    # log taken
    r = client.post(f"{API}/medications/log", json={"medication_id": med_id, "status": "taken"}, timeout=15)
    assert r.status_code == 200

    # delete
    r = client.delete(f"{API}/medications/{med_id}", timeout=15)
    assert r.status_code == 200

    r = client.get(f"{API}/medications", timeout=15)
    assert not any(m["id"] == med_id for m in r.json()["medications"])


# ---------- Alerts read ----------
def test_alert_mark_read(client):
    alerts = client.get(f"{API}/alerts", timeout=15).json()
    if not alerts:
        pytest.skip("no alerts to mark")
    aid = alerts[0]["id"]
    r = client.post(f"{API}/alerts/{aid}/read", timeout=15)
    assert r.status_code == 200
    # verify
    alerts2 = client.get(f"{API}/alerts", timeout=15).json()
    target = next(a for a in alerts2 if a["id"] == aid)
    assert target["read"] is True


# ---------- SOS ----------
def test_sos_trigger_and_history(client):
    r = client.post(f"{API}/sos", json={"location": "Jaipur home", "note": "test"}, timeout=15)
    assert r.status_code == 200
    ev = r.json()
    assert ev["status"] == "sent"

    r = client.get(f"{API}/sos/history", timeout=15)
    assert r.status_code == 200
    history = r.json()
    assert any(e["id"] == ev["id"] for e in history)

    # alert should be created
    alerts = client.get(f"{API}/alerts", timeout=15).json()
    assert any(a["type"] == "sos" for a in alerts)


# ---------- Dashboard ----------
def test_dashboard(client):
    r = client.get(f"{API}/dashboard", timeout=15)
    assert r.status_code == 200
    d = r.json()
    assert "user" in d and "medications" in d and "unread_alerts" in d and "adherence" in d
    assert d["user"]["email"] == TEST_EMAIL


# ---------- AI Coach ----------
def test_coach_chat_returns_reply(client):
    r = client.post(
        f"{API}/coach/chat",
        json={"message": "I feel slightly dizzy after lunch today, what should I do?"},
        timeout=90,
    )
    assert r.status_code == 200, r.text
    d = r.json()
    assert d["reply"] and isinstance(d["reply"], str) and len(d["reply"]) > 10
    assert d["session_id"]


# ---------- Food ----------
def _make_real_food_jpeg_b64() -> str:
    """Generate a real JPEG image with visual features (circles/textures) so the
    image has edges, not a solid color.
    """
    img = Image.new("RGB", (256, 256), (220, 200, 160))
    px = img.load()
    # simulate a plate with colored blobs (dal, rice, curry)
    for y in range(256):
        for x in range(256):
            dx, dy = x - 80, y - 128
            if dx * dx + dy * dy < 45 * 45:
                px[x, y] = (230, 210, 130)  # dal
            dx, dy = x - 180, y - 100
            if dx * dx + dy * dy < 40 * 40:
                px[x, y] = (240, 240, 230)  # rice
            dx, dy = x - 170, y - 190
            if dx * dx + dy * dy < 35 * 35:
                px[x, y] = (180, 90, 60)  # curry
            if (x + y) % 17 == 0:
                r0, g0, b0 = px[x, y]
                px[x, y] = (max(0, r0 - 20), max(0, g0 - 20), max(0, b0 - 20))
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=85)
    return base64.b64encode(buf.getvalue()).decode()


def test_food_analyze_by_name(client):
    r = client.post(f"{API}/food/analyze", json={"food_name": "Jalebi"}, timeout=90)
    assert r.status_code == 200, r.text
    d = r.json()
    assert "verdict" in d and d["verdict"] in ("safe", "limit", "avoid")
    assert "reason" in d
    assert "alternatives" in d


def test_food_analyze_by_image(client):
    b64 = _make_real_food_jpeg_b64()
    r = client.post(f"{API}/food/analyze", json={"image_base64": b64}, timeout=120)
    assert r.status_code == 200, r.text
    d = r.json()
    assert "verdict" in d
    assert "food_name" in d


def test_food_analyze_missing_input(client):
    r = client.post(f"{API}/food/analyze", json={}, timeout=15)
    assert r.status_code == 400


# ---------- Voice ----------
def test_voice_summary(client):
    r = client.get(f"{API}/voice/summary", timeout=60)
    assert r.status_code == 200
    d = r.json()
    assert "language" in d and "summary" in d and "date" in d
    assert len(d["summary"]) > 10
