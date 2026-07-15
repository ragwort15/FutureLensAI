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
        result = graph.invoke({"decision": request.decision})
    except Exception as exc:
        # TODO(backend): narrow this down once real failure modes show up
        # (Tavily timeout vs. Gemini JSON parse failure need different messages).
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
    )
