from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import random
import uvicorn

app = FastAPI(title="ResQ AI — Analytics Service")

class IncidentData(BaseModel):
    id: str
    description: str
    location: str

@app.get("/")
async def root():
    return {"status": "online", "service": "ResQ AI Analytics Engine"}

@app.post("/analyze")
async def analyze_incident(data: IncidentData):
    # Simulated advanced NLP analysis for the hackathon
    severity_score = random.uniform(0.6, 0.98)
    risk_factors = ["Infrastructure Damage", "Population Density", "Terrain Vulnerability"]
    
    return {
        "incident_id": data.id,
        "advanced_metrics": {
            "severity_score": round(severity_score, 2),
            "priority_level": "CRITICAL" if severity_score > 0.8 else "HIGH",
            "impact_radius_km": random.randint(1, 15),
            "risk_factors": random.sample(risk_factors, 2),
            "suggested_response_units": random.randint(3, 10)
        },
        "engine": "ResQ-Analytics-V2"
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
