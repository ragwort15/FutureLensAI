"""
Evaluation agent — merges "Evaluation" + "Explanation" from the original design.

Scores each scenario, writes a comparison summary, extracts the assumptions
behind the analysis, and suggests useful follow-up questions.
"""

import json

from langchain_google_genai import ChatGoogleGenerativeAI

from app.agents._user import decision_instruction, user_block
from app.config import GEMINI_API_KEY

_llm = ChatGoogleGenerativeAI(model="gemini-flash-lite-latest", google_api_key=GEMINI_API_KEY)

EVAL_PROMPT = """You are scoring scenarios for a decision-maker.

Decision: "{decision}"

{user}
Scenarios:
{scenarios}

Do five things:
1. Assign a score from 0-100 to each scenario representing overall favorability
   for this specific decision-maker (weighing upside against the listed risks
   in light of their situation, if provided).
2. Write a 2-3 sentence summary comparing all three scenarios and the key
   tradeoff between them.
3. Write a ONE-SENTENCE VERDICT — the direct answer to the user's question.
   Start with a clear "Yes", "No", "Not yet", or "It depends —" and then a
   short reason. Speak directly to the user in second person ("you"). This
   is what they'll read first, so make it crisp and honest.
4. List 2-4 key ASSUMPTIONS your analysis rests on (things you took as given
   about the decision-maker or context — e.g. "assumed a 1-year horizon",
   "assumed no major family constraints", "assumed relocation is feasible").
5. Suggest 2-3 useful follow-up questions the decision-maker could ask to
   pressure-test or refine this analysis.
{extra_instruction}

Respond with ONLY valid JSON, no markdown fences, in this exact shape:
{{
  "scores": [<score1>, <score2>, <score3>],
  "summary": "2-3 sentence comparison",
  "verdict": "One sentence starting with Yes/No/Not yet/It depends —",
  "assumptions": ["...", "..."],
  "next_questions": ["...", "..."]
}}
"""


def run_evaluation(
    decision: str,
    scenarios: list[dict],
    user: dict | None = None,
    clarify: dict | None = None,
    decision_context: dict | None = None,
) -> dict:
    """
    Returns: {
        "scores": [float, float, float],
        "summary": str,
        "assumptions": [str, ...],
        "next_questions": [str, ...],
    }
    """
    scenarios_text = "\n".join(
        f"{i+1}. {s['title']}: {s['narrative']} (risks: {', '.join(s['risks'])})"
        for i, s in enumerate(scenarios)
    )
    prompt = EVAL_PROMPT.format(
        decision=decision,
        scenarios=scenarios_text,
        user=user_block(user, clarify, decision_context),
        extra_instruction=decision_instruction(decision_context),
    )
    response = _llm.invoke(prompt)

    text = response.content.strip()
    if text.startswith("```"):
        text = text.strip("`")
        text = text.split("\n", 1)[1] if "\n" in text else text
        text = text.rsplit("```", 1)[0] if "```" in text else text

    data = json.loads(text)
    return {
        "scores": data.get("scores", []),
        "summary": data.get("summary", ""),
        "verdict": data.get("verdict", ""),
        "assumptions": data.get("assumptions", []),
        "next_questions": data.get("next_questions", []),
    }
