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

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
