from typing import Optional

from pydantic import BaseModel, Field


class UserDetails(BaseModel):
    name: str
    age: str
    occupation: str
    location: str
    lifeStage: str


class DecisionRequest(BaseModel):
    decision: str = Field(..., min_length=1, description="The decision the user is weighing, in their own words.")
    user: Optional[UserDetails] = None


class Evidence(BaseModel):
    title: str
    url: str


class ScenarioResult(BaseModel):
    title: str
    narrative: str
    score: float = Field(..., ge=0, le=100, description="Evaluation agent's score for this scenario, 0-100.")
    risks: list[str]
    evidence: list[Evidence]


class AnalyzeResponse(BaseModel):
    decision: str
    scenarios: list[ScenarioResult]
    summary: str = Field(..., description="Evaluation agent's short comparison across all scenarios.")
