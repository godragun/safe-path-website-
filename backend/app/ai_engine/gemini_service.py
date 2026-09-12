import os
from google import genai
from pydantic import BaseModel, Field

# Initialize the Gemini client using the GEMINI_API_KEY environment variable.
# Ensure this is set in the backend environment, NEVER in the frontend.
try:
    client = genai.Client()
except Exception as e:
    print(f"Warning: Failed to initialize Gemini client. Is GEMINI_API_KEY set? {e}")
    client = None

# Structured Output Models
class PreparationTask(BaseModel):
    task: str = Field(description="A concise preparation task, e.g., 'Charge power bank'")
    condition: str = Field(description="The condition for this task, e.g., 'NOW', 'IF RISK REACHES 70', 'IF OFFICIAL WARNING'")

class AutopilotPlan(BaseModel):
    summary: str = Field(description="A brief summary of the current situation and why these preparations are needed.")
    tasks: list[PreparationTask] = Field(description="List of tasks categorized by their condition timeline.")

class RiskExplanation(BaseModel):
    concise_explanation: str = Field(description="A short, clear explanation of the current risk.")
    recommended_action: str = Field(description="The immediate recommended action.")

def get_autopilot_plan(risk_data: dict) -> dict:
    """
    Calls Gemini to generate a Pre-Disaster Autopilot plan based on current risk data.
    """
    if not client:
        # Fallback if no API key is present
        return {
            "summary": "API Key missing. Running in offline/fallback mode.",
            "tasks": [
                {"task": "Prepare emergency bag", "condition": "NOW"},
                {"task": "Review evacuation routes", "condition": "IF RISK REACHES 70"}
            ]
        }
    
    prompt = f"""
    You are the SafePath AI Risk Engine. Generate a Pre-Disaster Autopilot preparation plan.
    Current Risk Data: {risk_data}
    
    Provide a brief summary and a list of actionable preparation tasks.
    Categorize tasks by conditions like 'NOW', 'IF RISK REACHES 70', or 'IF OFFICIAL WARNING'.
    Do NOT recommend dangerous actions. Only recommend preparations, not automatic physical control.
    """
    
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config={
                'response_mime_type': 'application/json',
                'response_schema': AutopilotPlan,
                'temperature': 0.2,
            },
        )
        # response.parsed is a Pydantic object
        if response.parsed:
            return response.parsed.model_dump()
        return {"summary": "Failed to parse", "tasks": []}
    except Exception as e:
        print(f"Gemini API Error: {e}")
        return {
            "summary": "Failed to generate dynamic plan. Running in fallback mode.",
            "tasks": [
                {"task": "Prepare emergency bag", "condition": "NOW"},
                {"task": "Stay alert for updates", "condition": "ALWAYS"}
            ]
        }

def get_risk_explanation(risk_data: dict) -> dict:
    """
    Calls Gemini to explain the current risk in a concise, human-readable format.
    """
    if not client:
        return {
            "concise_explanation": "Risk levels are currently elevated based on local telemetry.",
            "recommended_action": "Monitor local alerts."
        }
    
    prompt = f"""
    You are the SafePath AI Risk Engine. Explain the following risk data clearly and concisely.
    Current Risk Data: {risk_data}
    
    Provide a concise explanation and one immediate recommended action.
    """
    
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config={
                'response_mime_type': 'application/json',
                'response_schema': RiskExplanation,
                'temperature': 0.2,
            },
        )
        if response.parsed:
            return response.parsed.model_dump()
        return {"concise_explanation": "Error", "recommended_action": "Error"}
    except Exception as e:
        print(f"Gemini API Error: {e}")
        return {
             "concise_explanation": "Risk levels are currently elevated based on local telemetry.",
             "recommended_action": "Monitor local alerts."
        }

class SurvivalKitItem(BaseModel):
    id: str = Field(description="A unique ID string like 'ai_1'")
    name: str = Field(description="Name of the item")
    reason: str = Field(description="Why it is needed in this specific disaster context")
    quantity: str = Field(description="Recommended quantity")
    category: str = Field(description="Category, e.g., WATER, FOOD, FIRST AID, LIGHT, COMMUNICATION, SPECIAL, DOCUMENTS")

class SurvivalKitResponse(BaseModel):
    items: list[SurvivalKitItem] = Field(description="List of survival kit items")

def generate_srilanka_kit(disaster_context: str) -> dict:
    """
    Calls Gemini to generate a tailored survival kit for a specific disaster in Sri Lanka.
    """
    if not client:
        return {
            "items": [
                {"id": "ai_1", "name": "Mosquito Repellent (DEET)", "reason": "Dengue risk is high during floods in Sri Lanka", "quantity": "1 bottle", "category": "FIRST AID"},
                {"id": "ai_2", "name": "King Coconut Water", "reason": "Natural hydration and electrolytes", "quantity": "2 bottles", "category": "WATER"},
                {"id": "ai_3", "name": "NIC & Documents in waterproof bag", "reason": "Required for relief camps and checkpoints", "quantity": "1 set", "category": "DOCUMENTS"}
            ]
        }
        
    prompt = f"""
    You are the SafePath AI Risk Engine. Generate a list of 4 to 6 highly specific, critical survival kit items 
    tailored to a {disaster_context} disaster occurring in Sri Lanka. 
    Focus on local context (e.g., tropical climate, local diseases like Dengue, local food types, local infrastructure).
    Return them as a JSON list. Do not include standard generic items like a normal flashlight unless it has a specific local twist.
    """
    
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config={
                'response_mime_type': 'application/json',
                'response_schema': SurvivalKitResponse,
                'temperature': 0.7,
            },
        )
        if response.parsed:
            return response.parsed.model_dump()
        return {"items": []}
    except Exception as e:
        print(f"Gemini API Error: {e}")
        return {
            "items": [
                {"id": "ai_1", "name": "Mosquito Repellent (DEET)", "reason": "Dengue risk is high in Sri Lanka", "quantity": "1 bottle", "category": "FIRST AID"},
                {"id": "ai_2", "name": "Waterproof Pouch for NIC", "reason": "To protect National Identity Card", "quantity": "1 pouch", "category": "DOCUMENTS"}
            ]
        }
