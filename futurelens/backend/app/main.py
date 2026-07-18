from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.config import CORS_ORIGINS
from app.graph import get_graph
from app.schemas import AnalyzeResponse, DecisionRequest, Evidence, ScenarioResult

app = FastAPI(title="FutureLens API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/analyze", response_model=AnalyzeResponse)
def analyze(request: DecisionRequest):
    graph = get_graph()

    try:
        result = graph.invoke({
            "decision": request.decision,
            "user": request.user.model_dump() if request.user else None,
            "clarify": request.clarifyAnswers or None,
            "decision_context": request.decisionContext or None,
        })
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Pipeline failed: {exc}") from exc

    scenarios = [
        ScenarioResult(
            title=s["title"],
            narrative=s["narrative"],
            risks=s["risks"],
            score=result["scores"][i],
            evidence=[Evidence(**e) for e in result["evidence"]],
        )
        for i, s in enumerate(result["scenarios"])
    ]

    return AnalyzeResponse(
        decision=request.decision,
        scenarios=scenarios,
        summary=result["summary"],
        verdict=result.get("verdict", "") or "",
        assumptions=result.get("assumptions", []) or [],
        nextQuestions=result.get("next_questions", []) or [],
    )
