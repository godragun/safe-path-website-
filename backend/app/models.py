from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class Location(BaseModel):
    lat: float
    lng: float

class CitizenReport(BaseModel):
    id: str
    location: Location
    description: str
    image_url: Optional[str]
    timestamp: datetime
    ward_id: str

class GaugeReading(BaseModel):
    gauge_id: str
    location: Location
    water_level_m: float
    flow_rate_m3s: float
    timestamp: datetime

class SimulationState(BaseModel):
    time_elapsed_min: int
    reports: List[CitizenReport]
    gauges: List[GaugeReading]
    active_warnings: List[str]
