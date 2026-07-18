"""
Research agent — merges "Planner" + "Research" from the original design.

Takes the raw decision text, pulls a handful of relevant sources via Tavily,
and asks Gemini to distill them into a short context brief the downstream
agents can condition on.
"""

from langchain_google_genai import ChatGoogleGenerativeAI
from tavily import TavilyClient

from app.agents._user import user_block
from app.config import GEMINI_API_KEY, TAVILY_API_KEY

_tavily = TavilyClient(api_key=TAVILY_API_KEY)
_llm = ChatGoogleGenerativeAI(model="gemini-flash-lite-latest", google_api_key=GEMINI_API_KEY)

CONTEXT_PROMPT = """You are a research analyst. A user is weighing the following decision:

"{decision}"

{user}
Below are web search results related to this decision. Distill them into a short
(3-5 sentence) factual brief covering the most relevant context, trends, or data
points a decision-maker should know. If the decision-maker's details are provided
above, prioritize context that is relevant to their situation. Do not give an
opinion or recommendation — just the facts.

Search results:
{results}
"""


def run_research(
    decision: str,
    user: dict | None = None,
    clarify: dict | None = None,
    decision_context: dict | None = None,
) -> dict:
    """
    Returns:
        {
            "context": str,               # short factual brief for downstream agents
            "evidence": [{"title": str, "url": str}, ...]
        }
    """
    # TODO(backend): tune query construction — using the raw decision text works
    # for a demo but a sharper search query will pull better sources.
    search = _tavily.search(query=decision, max_results=5)
    results = search.get("results", [])

    evidence = [{"title": r["title"], "url": r["url"]} for r in results]
    results_text = "\n".join(f"- {r['title']}: {r.get('content', '')[:300]}" for r in results)

    prompt = CONTEXT_PROMPT.format(
        decision=decision,
        user=user_block(user, clarify, decision_context),
        results=results_text or "No results found.",
    )
    response = _llm.invoke(prompt)

    return {
        "context": response.content,
        "evidence": evidence,
    }
