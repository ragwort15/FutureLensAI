"""
Wires the 3 agents into a single sequential LangGraph pipeline:

    research -> scenarios -> evaluation

Kept deliberately simple (linear, no branching/retries) — that's the honest
scope for a hackathon demo. Retries/branching are easy to add later if the
pipeline needs to get more robust.
"""

from typing import TypedDict

from langgraph.graph import END, StateGraph

from app.agents.evaluation_agent import run_evaluation
from app.agents.research_agent import run_research
from app.agents.scenario_agent import run_scenarios


class PipelineState(TypedDict, total=False):
    decision: str
    user: dict | None
    clarify: dict | None
    decision_context: dict | None
    context: str
    evidence: list[dict]
    scenarios: list[dict]
    scores: list[float]
    summary: str
    verdict: str
    assumptions: list[str]
    next_questions: list[str]


def research_node(state: PipelineState) -> dict:
    result = run_research(
        state["decision"], state.get("user"), state.get("clarify"), state.get("decision_context")
    )
    return {"context": result["context"], "evidence": result["evidence"]}


def scenario_node(state: PipelineState) -> dict:
    scenarios = run_scenarios(
        state["decision"], state["context"], state.get("user"),
        state.get("clarify"), state.get("decision_context"),
    )
    return {"scenarios": scenarios}


def evaluation_node(state: PipelineState) -> dict:
    result = run_evaluation(
        state["decision"], state["scenarios"], state.get("user"),
        state.get("clarify"), state.get("decision_context"),
    )
    return {
        "scores": result["scores"],
        "summary": result["summary"],
        "verdict": result.get("verdict", ""),
        "assumptions": result.get("assumptions", []),
        "next_questions": result.get("next_questions", []),
    }


def build_graph():
    graph = StateGraph(PipelineState)

    graph.add_node("research", research_node)
    graph.add_node("scenario", scenario_node)
    graph.add_node("evaluation", evaluation_node)

    graph.set_entry_point("research")
    graph.add_edge("research", "scenario")
    graph.add_edge("scenario", "evaluation")
    graph.add_edge("evaluation", END)

    return graph.compile()


_compiled_graph = None


def get_graph():
    global _compiled_graph
    if _compiled_graph is None:
        _compiled_graph = build_graph()
    return _compiled_graph
