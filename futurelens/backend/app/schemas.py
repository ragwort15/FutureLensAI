from typing import Optional

from pydantic import BaseModel, Field


class UserDetails(BaseModel):
    name: str
    age: str
    location: str
    lifeStage: str


class DecisionRequest(BaseModel):
    decision: str = Field(..., min_length=1, description="The decision the user is weighing, in their own words.")
    user: Optional[UserDetails] = None
    clarifyAnswers: Optional[dict] = None
    decisionContext: Optional[dict] = None


class Evidence(BaseModel):
    title: str
    url: str


class ScenarioResult(BaseModel):
    title: str
    narrative: str
    score: float = Field(..., ge=0, le=100)
    risks: list[str]
    evidence: list[Evidence]


class AnalyzeResponse(BaseModel):
    decision: str
    scenarios: list[ScenarioResult]
    summary: str
    verdict: str = ""
    assumptions: list[str] = []
    nextQuestions: list[str] = []
