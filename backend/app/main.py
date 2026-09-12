from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from .ai_engine.simulator import storm_event_generator

app = FastAPI(title="Disaster Response AI Engine", version="1.0.0")

# Allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "operational", "system": "Disaster Response AI"}

@app.get("/api/simulate-storm")
async def simulate_storm():
    """
    SSE Endpoint for the Interactive Replay Engine.
    Streams localized storm telemetry and citizen reports to the frontend.
    """
    return StreamingResponse(
        storm_event_generator(), 
        media_type="text/event-stream"
    )

from pydantic import BaseModel
import random
import asyncio
from .ai_engine.gemini_service import get_autopilot_plan, get_risk_explanation, generate_srilanka_kit

@app.get("/api/survival-kit")
async def survival_kit_endpoint(context: str = "general"):
    """
    Returns AI-generated survival kit items for Sri Lanka based on the disaster context.
    """
    try:
        data = generate_srilanka_kit(context)
        return data
    except Exception as e:
        return {"items": [], "error": str(e)}

class ChatRequest(BaseModel):
    message: str

class PredictRequest(BaseModel):
    temperature: float
    rainfall_mm: float
    satellite_hash: str

class SMSRequest(BaseModel):
    phone: str
    message: str

@app.post("/api/chat")
async def chat_endpoint(req: ChatRequest):
    """NVIDIA/Gemini Chatbot Endpoint"""
    # Simply using a mock response or the risk explanation since the OpenAI client is removed
    return {"reply": "SafePath AI: I am currently optimized for the Pre-Disaster Autopilot. Please check the dashboard for the latest survival intelligence."}

@app.post("/api/predict")
async def predict_endpoint(req: PredictRequest):
    """SafePath AI Risk Engine + Pre-Disaster Autopilot"""
    await asyncio.sleep(1) # Simulate heavy processing

    # 1. Compute Numerical Risk Score (SafePath Risk Engine)
    base_risk = (req.rainfall_mm / 150.0) + (req.temperature / 100.0)

    if base_risk > 0.8:
        risk_level = "CRITICAL"
        prob = min(0.99, base_risk)
    elif base_risk > 0.4:
        risk_level = "WARNING"
        prob = base_risk
    else:
        risk_level = "ELEVATED"
        prob = max(0.01, base_risk)

    risk_data = {
        "risk_level": risk_level,
        "flood_probability": prob,
        "temperature": req.temperature,
        "rainfall_mm": req.rainfall_mm
    }

    # 2. Use Gemini to reason about the data and generate explanation/autopilot
    explanation = get_risk_explanation(risk_data)
    autopilot_plan = get_autopilot_plan(risk_data)

    return {
        "risk_level": risk_level,
        "flood_probability": prob,
        "confidence": random.uniform(0.85, 0.98),
        "recommendation": explanation.get("recommended_action", "Monitor alerts."),
        "explanation": explanation.get("concise_explanation", "Risk is elevated."),
        "autopilot": autopilot_plan
    }

@app.get("/api/community-pulse")
async def community_pulse_endpoint():
    """Aggregates and clusters community reports."""
    # Mocking the aggregation logic
    return {
        "incidents": [
            {
                "id": "INC-204",
                "hazard_type": "Flooding",
                "report_count": 37,
                "first_reported": "14:02",
                "latest_report": "14:27",
                "affected_radius_km": 1.2,
                "confidence": "HIGH",
                "trend": "Increasing",
                "lat": 6.927,
                "lng": 79.865
            },
            {
                "id": "INC-205",
                "hazard_type": "Fallen Tree",
                "report_count": 5,
                "first_reported": "14:15",
                "latest_report": "14:20",
                "affected_radius_km": 0.1,
                "confidence": "MEDIUM",
                "trend": "Stable",
                "lat": 6.905,
                "lng": 79.851
            }
        ]
    }

@app.post("/api/sms")
async def sms_endpoint(req: SMSRequest):
    """Mock SMS Dispatcher"""
    print(f"\n[SMS DISPATCH] To: {req.phone}\n[MESSAGE] {req.message}\n")
    return {"status": "sent", "timestamp": "now"}

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
