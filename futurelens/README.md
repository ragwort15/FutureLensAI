# FutureLens

Multi-agent AI decision simulation. You describe a decision you're facing; three agents research it, simulate three plausible scenarios, and score them so you can compare outcomes side by side.

> ChatGPT gives one answer. FutureLens gives three futures.

## How it works

1. **Research agent** — parses the decision, pulls supporting evidence via Tavily web search.
2. **Scenario agent** — generates three grounded future scenarios and flags risks in each.
3. **Evaluation agent** — scores each scenario and writes the comparison summary.

The three agents are wired together with LangGraph and run behind a single FastAPI endpoint. No database, no auth — everything is in-memory for the demo.

## Repo layout

```
backend/    FastAPI + LangGraph pipeline, owned by backend
frontend/   Next.js + Tailwind + Recharts dashboard, owned by frontend
```

## Team split

| | Owns |
|---|---|
| Backend | `backend/` — the 3 agents, the LangGraph pipeline, the `/analyze` endpoint |
| Frontend | `frontend/` — decision form, comparison dashboard, Vercel deploy |

The contract between the two halves is the JSON shape of `POST /analyze`, defined in `backend/app/schemas.py` and mirrored in `frontend/lib/types.ts`. Change one, change the other.

## Local setup

**Backend**
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in GEMINI_API_KEY and TAVILY_API_KEY
uvicorn app.main:app --reload --port 8000
```

**Frontend**
```bash
cd frontend
npm install
cp .env.local.example .env.local   # set NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev
```

For the live demo, run the backend locally and tunnel it with `ngrok http 8000`, then point the deployed frontend's `NEXT_PUBLIC_API_URL` at the ngrok URL.

## Minimum scope

One working end-to-end flow: input -> 3-agent pipeline -> dashboard with 3 scenarios, scores, and evidence links. No login, no history, no persistence. Everything past this is stretch — cut it first if you're short on time.
