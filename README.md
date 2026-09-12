# SafePath

SafePath is an AI-assisted disaster response command center for urban flash-flood scenarios. It combines a live incident map, simulated citizen reports, river telemetry, explainable hazard audits, risk prediction, emergency procedures, and responder communication tools in one operational interface.

## Why It Helps

- **Faster situational awareness:** responders can see reports, gauge readings, active warnings, and hazard locations together instead of switching between tools.
- **Better prioritization:** the prediction engine synthesizes temperature, rainfall, and satellite metadata into a risk level, probability, confidence score, and recommended action.
- **More trustworthy reports:** the XAI audit drawer shows why a report was accepted, flagged for review, or rejected across image, weather, cluster, location, and infrastructure checks.
- **Lower access friction:** guest access lets users view the command center without creating credentials first.
- **Resilience during outages:** the PWA service worker caches the command center shell and an offline survival guide for use when connectivity is unreliable.
- **Clearer public guidance:** the offline guide provides concise flash-flood procedures for evacuation, water safety, supplies, and checking on vulnerable people.
- **Communication readiness:** the SMS endpoint provides a local mock dispatch contract that can later be connected to a real provider such as Twilio or Azure Communication Services.

## Features

### Command center dashboard

- Interactive MapLibre map with severity-coded hazard markers.
- Storm replay using Server-Sent Events from the FastAPI backend.
- Live feed for citizen reports, gauge readings, and warnings.
- Operations statistics for reports, confirmed hazards, peak gauge level, warnings, clusters, and elapsed simulation time.
- Flat, high-contrast command-center UI designed for scanning and repeated use.

### AI-assisted tools

- Floating SafePath AI chatbot for flood procedures, situation status, and preparedness questions.
- Prediction Engine panel for temperature, rainfall, and satellite hash inputs.
- XAI Audit Drawer for evidence behind each hazard classification.

### Access and offline support

- Login and signup screens with **Continue as Guest**.
- Installable Next.js PWA manifest.
- Service worker with cached dashboard and offline guide fallback.
- `/offline-guide` route with survival procedures.

### Backend demo APIs

| Endpoint | Method | Purpose |
| --- | --- | --- |
| `/` | GET | API health response |
| `/api/simulate-storm` | GET | SSE storm telemetry and report replay |
| `/api/chat` | POST | Mock emergency-assistant response generator |
| `/api/predict` | POST | Mock telemetry risk synthesis |
| `/api/sms` | POST | Mock SMS dispatch response |

## Project Structure

```text
backend/
  app/
    main.py                 FastAPI app and demo endpoints
    ai_engine/simulator.py  Storm replay event generator

frontend/
  src/app/                  Next.js App Router pages and global styles
  src/components/           Map, feed, chatbot, prediction, and audit UI
  public/sw.js              PWA service worker
```

## Run Locally

### Backend

The backend uses the included virtual environment on Windows:

```powershell
cd backend
.\venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
```

The API is available at [http://localhost:8000](http://localhost:8000).

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

The command center is available at [http://localhost:3000](http://localhost:3000).

Useful checks:

```powershell
npm run lint
npx tsc --noEmit
npm run build
```

## Demo and Production Boundaries

This repository is currently a functional demo foundation:

- Chat, prediction, and SMS responses are mocked.
- Storm telemetry is synthetic and intended for drills, demos, and UI validation.
- Login and signup are navigation-only flows; production identity, authorization, and audit logging still need to be added.
- The map uses OpenStreetMap raster tiles and requires network access for fresh tiles.
- Emergency decisions should use verified local authorities and real telemetry before operational deployment.

## Technology

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS, MapLibre GL, Lucide, Framer Motion.
- **Backend:** FastAPI, Pydantic, Uvicorn, Python.
- **Offline:** Web App Manifest and service worker.

## License

No license has been selected yet. Add a license before distributing the project publicly.