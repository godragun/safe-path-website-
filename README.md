# SafePath: Advanced Disaster Resilience Platform

![SafePath Dashboard](docs/Screenshot%202026-09-13%20004717.png)

## The Problem Statement
During natural disasters like floods, tsunamis, and landslides (especially in vulnerable areas like Sri Lanka), traditional communication networks fail, evacuation routes become unpredictably blocked, and people panic without clear, actionable guidance. Most disaster management websites offer static information that becomes useless when the crisis hits and the internet goes down.

## What is SafePath?
SafePath is an AI-powered, offline-first disaster intelligence and emergency guidance platform. It acts as an adaptive command center that doesn't just show you the weather—it guides you through the crisis step-by-step, even when critical infrastructure fails. 

## How It Works
SafePath utilizes a Next.js frontend combined with a FastAPI/Python risk engine backend. It uses real-time telemetry and Gemini AI to calculate threat levels. When a crisis is imminent, SafePath shifts into **Emergency Mode**. If the internet disconnects, SafePath's Progressive Web App (PWA) capabilities and IndexedDB storage keep the app running, queuing your emergency reports and providing offline fallback communication methods.

## Unique Features Highlighted

### 1. Offline-First Emergency Queue
- **What it is:** A resilient reporting system using Service Workers and IndexedDB.
- **How it helps:** If you lose internet, you can still submit emergency reports. SafePath stores them locally and automatically syncs them to the centralized Supabase database the moment connectivity is restored.

### 2. Pre-Disaster AI Autopilot & Dynamic Survival Kits
- **What it is:** Gemini AI-powered checklists dynamically generated based on the specific disaster and localized context (e.g., Sri Lanka).
- **How it helps:** Instead of generic advice, if a flood hits Sri Lanka, the AI instructs you to pack DEET mosquito repellent (for Dengue) and secure your National Identity Card (NIC). It randomizes and updates tasks based on the changing threat level (NOW, WARNING, CRITICAL).

### 3. Resilience Routing Fallback Ladder
- **What it is:** A dynamic evacuation map that calculates a Primary, Alternative, and Last Resort route.
- **How it helps:** As disasters progress and roads flood or bridges collapse, SafePath automatically invalidates the Primary route and switches you to the Alternative route, ensuring you never get trapped.

### 4. Tiered Communication Hub
- **What it is:** A dedicated `/communication` module for when cell towers fail.
- **How it helps:** Guides users through a fallback ladder: Mesh Networks (Bluetooth/Wi-Fi Direct) for local peers, HAM/FM Radio for national broadcasts, and Satellite links as a last resort.

### 5. Signature Emergency Mode UI
- **What it is:** A context-aware UI that automatically switches to a high-contrast, low-brightness dark red mode during critical events.
- **How it helps:** Reduces eye strain in dark environments, conserves battery life (especially on OLED screens), and immediately signals the severity of the situation to the user without them reading a word.

## How This Saves Lives
By combining **offline availability**, **AI-contextualized survival kits**, and **dynamic route recalculation**, SafePath removes panic and hesitation. People know exactly what to do, what to pack, and where to go, even when the internet is entirely cut off.

## Technology Stack
- **Frontend:** Next.js 14, React, TailwindCSS, MapLibre GL
- **Backend:** FastAPI, Python, Google Gemini AI Engine
- **Database / Auth:** Supabase (PostgreSQL), Supabase SSR
- **Offline Storage:** IndexedDB (idb), Service Workers (PWA)

---

## How to Run Locally

### Prerequisites
- Node.js (v22+)
- Python (3.10+)
- A Supabase project

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate | Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
```
Create a `.env` file in the `backend` directory:
```env
GEMINI_API_KEY=your_gemini_key_here
```
Run the backend:
```bash
uvicorn app.main:app --reload
```

### 2. Frontend Setup
```bash
cd frontend
npm install
```
Create a `.env.local` file in the `frontend` directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```
Run the frontend:
```bash
npm run dev
```

Visit `http://localhost:3000` to access the SafePath Command Center!