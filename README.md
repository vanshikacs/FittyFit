# Fittyfit 🩺

**India-First AI Health Companion for Elderly Care**

Premium, futuristic healthcare AI app built with FastAPI + React + MongoDB, powered by OpenAI `gpt-4o`.

## 🎨 Features
- 🤖 AI Health Coach (gpt-4o, context-aware)
- 🥗 Food Analysis (image + text, Safe / Limit / Avoid verdict)
- 💊 Medication Tracker (CRUD, adherence %, caregiver alerts on miss)
- 📞 Daily Voice Health Summary (Hindi/English/regional)
- 🚨 One-tap Emergency SOS (geolocation + caregiver alert)
- 🛎️ Caregiver Alerts feed (priority badges)
- 🎉 Cultural Mode + ☀️ Seasonal Mode tips
- 👤 JWT auth with role selection (Elder / Caregiver)

## 🚀 Quick start — Docker (one command)

```bash
# 1. Clone
git clone https://github.com/<you>/fittyfit.git
cd fittyfit

# 2. Copy env template
cp .env.example .env
# (edit .env to set your own JWT_SECRET; EMERGENT_LLM_KEY is prefilled)

# 3. Run everything
docker compose up --build

# App → http://localhost:3000
# API → http://localhost:8001/api/
```

Press `Ctrl+C` to stop. Data persists in a Docker volume (`fittyfit_mongo`).

## 🛠️ Manual local setup (without Docker)

### Prerequisites
- Node.js 18+ · Python 3.11+ · MongoDB 7 · Yarn · VS Code

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt --extra-index-url https://d33sy5i8bnduwe.cloudfront.net/simple/

# Create backend/.env
echo 'MONGO_URL=mongodb://localhost:27017
DB_NAME=fittyfit
CORS_ORIGINS=*
EMERGENT_LLM_KEY=sk-emergent-18243F0524e5d0aA7C
JWT_SECRET=change-me' > .env

uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

### Frontend
```bash
cd frontend
yarn install

# Create frontend/.env
echo 'REACT_APP_BACKEND_URL=http://localhost:8001' > .env

yarn start
```

## 📁 Project structure
```
fittyfit/
├── docker-compose.yml        # One-command local runtime
├── .env.example              # Secrets template (EMERGENT_LLM_KEY, JWT_SECRET)
├── backend/
│   ├── Dockerfile
│   ├── server.py             # Full FastAPI app
│   ├── requirements.txt
│   └── .env                  # MONGO_URL, DB_NAME, EMERGENT_LLM_KEY, JWT_SECRET
└── frontend/
    ├── Dockerfile
    ├── package.json
    ├── tailwind.config.js    # Design tokens (navy, lime, sky)
    ├── craco.config.js       # @ alias → src/
    ├── public/index.html     # Fontshare: Cabinet Grotesk + Satoshi
    └── src/
        ├── App.js            # Router + protected routes
        ├── index.css         # Glass utilities + tokens
        ├── lib/              # api.js, auth.jsx
        ├── components/layout/# AppShell, ProtectedRoute
        └── pages/            # Landing, Login, Signup, Onboarding,
                              # Dashboard, Coach, Food, Medications,
                              # Voice, Alerts, SOS, Profile
```

## 🧪 Test credentials
```
email:    demo.shanti@fittyfit.in
password: Fittyfit@2026
```
Or create your own at `/signup`.

## 🧩 Tech stack
| Layer | Tech |
|---|---|
| Frontend | React 19, React Router 7, Tailwind 3, sonner, lucide-react |
| Fonts | Cabinet Grotesk + Satoshi (Fontshare) |
| Backend | FastAPI, Motor (MongoDB), PyJWT, bcrypt |
| AI | OpenAI gpt-4o via `emergentintegrations` + Emergent Universal LLM Key |
| Database | MongoDB 7 |

## 🔑 Getting an Emergent LLM key
The included key works out-of-the-box on Emergent's platform. For self-hosted production, replace `EMERGENT_LLM_KEY` with your own OpenAI key and edit `server.py` to use the OpenAI SDK directly — or top up your Universal Key balance at https://emergent.sh.

## 📜 License
MIT
