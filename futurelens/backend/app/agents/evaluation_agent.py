"""
Evaluation agent — merges "Evaluation" + "Explanation" from the original design.

Takes the 3 generated scenarios and scores each one, then writes a short
summary comparing them so the user can see the tradeoffs at a glance.
"""

import json

from langchain_google_genai import ChatGoogleGenerativeAI

from app.config import GEMINI_API_KEY

_llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", google_api_key=GEMINI_API_KEY)

EVAL_PROMPT = """You are scoring scenarios for a decision-maker.

Decision: "{decision}"

Scenarios:
{scenarios}

For each scenario, assign a score from 0-100 representing overall favorability
(weighing upside against the listed risks). Then write a 2-3 sentence summary
comparing all three scenarios and what the key tradeoff is between them.

Respond with ONLY valid JSON, no markdown fences, in this exact shape:
{{
  "scores": [<score for scenario 1>, <score for scenario 2>, <score for scenario 3>],
  "summary": "2-3 sentence comparison"
}}
"""


def run_evaluation(decision: str, scenarios: list[dict]) -> dict:
    """
    Returns: {"scores": [float, float, float], "summary": str}
    """
    scenarios_text = "\n".join(
        f"{i+1}. {s['title']}: {s['narrative']} (risks: {', '.join(s['risks'])})"
        for i, s in enumerate(scenarios)
    )
    prompt = EVAL_PROMPT.format(decision=decision, scenarios=scenarios_text)
    response = _llm.invoke(prompt)

    text = response.content.strip()
    if text.startswith("```"):
        text = text.strip("`")
        text = text.split("\n", 1)[1] if "\n" in text else text
        text = text.rsplit("```", 1)[0] if "```" in text else text

    return json.loads(text)
