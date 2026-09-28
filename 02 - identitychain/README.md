# IDENTITYCHAIN

Decentralized Identity Infrastructure & Trust Network - a full-stack demo blockchain
identity system (FastAPI backend + React frontend).

## Run it

**1. Backend** (Terminal 1)

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Leave this running. It auto-seeds demo identities and blockchain blocks on first start.
Check it worked: open http://localhost:8000/docs in a browser - you should see the API docs.

**2. Frontend** (Terminal 2, new tab/window - keep Terminal 1 running)

```bash
cd frontend
npm install
npm run dev
```

Open the URL it prints (usually http://localhost:5173).

## If a page is blank

Open the browser DevTools console (F12 -> Console tab) - the app now shows the exact
error on-screen instead of a blank page if something breaks, and logs full details to
the console. Common causes:

- Backend not running / not finished starting -> start Terminal 1 first, wait for
  `Uvicorn running on http://127.0.0.1:8000`.
- `npm install` didn't finish or errored -> re-run `npm install` in `frontend/` and check
  for red error text.
- Port already in use -> close whatever else is using 8000 or 5173, or change the port.

## Project layout

```
identitychain/
+-- backend/    # FastAPI + custom blockchain, consensus, DHT, hashing engine
+-- frontend/   # React + Vite + Tailwind UI
```
