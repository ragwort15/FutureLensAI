"""
Evaluation agent — merges "Evaluation" + "Explanation" from the original design.

Takes the 3 generated scenarios and scores each one, then writes a short
summary comparing them so the user can see the tradeoffs at a glance.
"""

import json

from langchain_google_genai import ChatGoogleGenerativeAI

from app.agents._user import user_block
from app.config import GEMINI_API_KEY

_llm = ChatGoogleGenerativeAI(model="gemini-flash-latest", google_api_key=GEMINI_API_KEY)

EVAL_PROMPT = """You are scoring scenarios for a decision-maker.

Decision: "{decision}"

{user}
Scenarios:
{scenarios}

For each scenario, assign a score from 0-100 representing overall favorability
for this specific decision-maker (weighing upside against the listed risks in
light of their situation, if provided). Then write a 2-3 sentence summary
comparing all three scenarios and what the key tradeoff is between them.

Respond with ONLY valid JSON, no markdown fences, in this exact shape:
{{
  "scores": [<score for scenario 1>, <score for scenario 2>, <score for scenario 3>],
  "summary": "2-3 sentence comparison"
}}
"""


def run_evaluation(decision: str, scenarios: list[dict], user: dict | None = None) -> dict:
    """
    Returns: {"scores": [float, float, float], "summary": str}
    """
    scenarios_text = "\n".join(
        f"{i+1}. {s['title']}: {s['narrative']} (risks: {', '.join(s['risks'])})"
        for i, s in enumerate(scenarios)
    )
    prompt = EVAL_PROMPT.format(decision=decision, scenarios=scenarios_text, user=user_block(user))
    response = _llm.invoke(prompt)

    text = response.content.strip()
    if text.startswith("```"):
        text = text.strip("`")
        text = text.split("\n", 1)[1] if "\n" in text else text
        text = text.rsplit("```", 1)[0] if "```" in text else text

    return json.loads(text)
