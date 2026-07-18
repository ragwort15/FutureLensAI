from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.config import CORS_ORIGINS
from app.graph import get_graph
from app.schemas import AnalyzeResponse, DecisionRequest, Evidence, ScenarioResult, ScoreFactor

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
        })
    except Exception as exc:
        # TODO(backend): narrow this down once real failure modes show up
        # (Tavily timeout vs. Gemini JSON parse failure need different messages).
        raise HTTPException(status_code=502, detail=f"Pipeline failed: {exc}") from exc

    breakdowns = result.get("breakdowns", [])

    def breakdown_for(i: int) -> list[ScoreFactor] | None:
        # Evaluation agent output is LLM JSON — tolerate a missing/malformed
        # breakdown for a given scenario rather than failing the whole request;
        # the frontend falls back to a single-score bar chart when this is None.
        if i >= len(breakdowns):
            return None
        try:
            return [ScoreFactor(**f) for f in breakdowns[i]]
        except (TypeError, ValueError):
            return None

    scenarios = [
        ScenarioResult(
            title=s["title"],
            narrative=s["narrative"],
            risks=s["risks"],
            score=result["scores"][i],
            evidence=[Evidence(**e) for e in result["evidence"]],
            scoreBreakdown=breakdown_for(i),
        )
        for i, s in enumerate(result["scenarios"])
    ]

    return AnalyzeResponse(
        decision=request.decision,
        scenarios=scenarios,
        summary=result["summary"],
    )
