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
    """Mock AI Chatbot Endpoint"""
    await asyncio.sleep(1) # Simulate inference latency
    msg = req.message.lower()

    if "flood" in msg or "water" in msg:
        reply = "In a flash flood, immediately move to higher ground. Do not walk, swim, or drive through flood waters. Six inches of moving water can knock you down, and one foot can sweep your vehicle away."
    elif "status" in msg or "situation" in msg:
        reply = "Currently tracking a severe storm front. Peak river gauges are at breach levels. Expect localized flash flooding in low-lying wards."
    elif "supplies" in msg or "prepare" in msg:
        reply = "Ensure you have a 72-hour kit: 1 gallon of water per person per day, non-perishable food, flashlight, extra batteries, and a first aid kit."
    else:
        reply = "I am the SafePath AI. I monitor disaster telemetry and provide actionable intelligence. How can I assist you with your current situation?"

    return {"reply": reply}

@app.post("/api/predict")
async def predict_endpoint(req: PredictRequest):
    """Mock Deep Learning Risk Predictor"""
    await asyncio.sleep(2) # Simulate heavy processing

    # Calculate synthetic risk based on inputs
    base_risk = (req.rainfall_mm / 150.0) + (req.temperature / 100.0)

    if base_risk > 0.8:
        risk_level = "CRITICAL"
        prob = min(0.99, base_risk)
        rec = "IMMEDIATE EVACUATION REQUIRED. High probability of infrastructure failure."
    elif base_risk > 0.4:
        risk_level = "WARNING"
        prob = base_risk
        rec = "Deploy sandbags and issue flood advisories. Monitor closely."
    else:
        risk_level = "ELEVATED"
        prob = max(0.01, base_risk)
        rec = "Standard monitoring. No immediate threat."

    return {
        "risk_level": risk_level,
        "flood_probability": prob,
        "confidence": random.uniform(0.85, 0.98),
        "recommendation": rec
    }

@app.post("/api/sms")
async def sms_endpoint(req: SMSRequest):
    """Mock SMS Dispatcher"""
    print(f"\n[SMS DISPATCH] To: {req.phone}\n[MESSAGE] {req.message}\n")
    return {"status": "sent", "timestamp": "now"}

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
