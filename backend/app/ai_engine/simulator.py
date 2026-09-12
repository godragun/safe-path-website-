import asyncio
import random
import uuid
from datetime import datetime, timedelta
from typing import AsyncGenerator
import json

from ..models import CitizenReport, GaugeReading, Location

# Simulated wards in a city (e.g., Downtown, Northside)
WARDS = ["W-01", "W-02", "W-03"]

def generate_mock_reports(time_min: int) -> list[CitizenReport]:
    """Generates a burst of citizen reports as the storm worsens."""
    reports = []
    num_reports = int((time_min / 10) ** 1.5) + random.randint(0, 2)
    
    for _ in range(num_reports):
        reports.append(CitizenReport(
            id=str(uuid.uuid4())[:8],
            location=Location(
                lat=40.7128 + random.uniform(-0.02, 0.02),
                lng=-74.0060 + random.uniform(-0.02, 0.02)
            ),
            description=random.choice([
                "Water rising rapidly on Main St.",
                "Tree fell down, blocking the road.",
                "Flash flood in the underpass!",
                "Manhole cover blown off by pressure.",
                "Basement flooded."
            ]),
            image_url=f"mock_image_{random.randint(1,5)}.jpg",
            timestamp=datetime.utcnow(),
            ward_id=random.choice(WARDS)
        ))
    return reports

def generate_mock_gauges(time_min: int) -> list[GaugeReading]:
    """Simulates river gauges rising linearly with some noise over time."""
    gauges = []
    base_level = 1.5
    rate_of_rise = 0.05 # meters per minute
    
    for i in range(1, 4):
        current_level = base_level + (time_min * rate_of_rise) + random.uniform(-0.1, 0.1)
        gauges.append(GaugeReading(
            gauge_id=f"G-00{i}",
            location=Location(
                lat=40.7100 + (i * 0.005),
                lng=-74.0100 + (i * 0.005)
            ),
            water_level_m=round(current_level, 2),
            flow_rate_m3s=round(current_level * 15.5, 2),
            timestamp=datetime.utcnow()
        ))
    return gauges

async def storm_event_generator() -> AsyncGenerator[str, None]:
    """
    Async generator that yields Server-Sent Events (SSE) representing
    the localized storm over a compressed timeframe for the demo.
    """
    time_elapsed_min = 0
    max_duration_min = 120 # Simulate 2 hours of storm in a few minutes
    
    while time_elapsed_min <= max_duration_min:
        reports = generate_mock_reports(time_elapsed_min)
        gauges = generate_mock_gauges(time_elapsed_min)
        
        warnings = []
        if any(g.water_level_m > 4.5 for g in gauges):
            warnings.append("CRITICAL: River banks breached in Ward 2.")
            
        payload = {
            "time_elapsed_min": time_elapsed_min,
            "new_reports": [r.dict() for r in reports],
            "gauges": [g.dict() for g in gauges],
            "active_warnings": warnings
        }
        
        # Yield SSE format
        yield f"data: {json.dumps(payload, default=str)}\n\n"
        
        time_elapsed_min += 5 # Skip forward 5 minutes per tick
        await asyncio.sleep(1.5) # Yield every 1.5 real seconds for the demo
