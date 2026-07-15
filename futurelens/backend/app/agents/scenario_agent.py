"""
Scenario agent — merges "Simulation" + "Risk" from the original design.

Takes the decision plus the research agent's context brief and generates
three plausible, distinct future scenarios, each with a narrative and a
short list of risks.
"""

import json

from langchain_google_genai import ChatGoogleGenerativeAI

from app.config import GEMINI_API_KEY

_llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", google_api_key=GEMINI_API_KEY)

SCENARIO_PROMPT = """You are simulating plausible futures for a decision.

Decision: "{decision}"

Context: {context}

Generate exactly 3 distinct, plausible scenarios for how this could play out.
Make them meaningfully different from each other (e.g. best case, likely case,
worst case — or three genuinely different paths, whichever fits the decision).

Respond with ONLY valid JSON, no markdown fences, in this exact shape:
[
  {{
    "title": "Short scenario name",
    "narrative": "2-4 sentence description of how this plays out",
    "risks": ["risk 1", "risk 2"]
  }},
  ... (3 total)
]
"""


def run_scenarios(decision: str, context: str) -> list[dict]:
    """
    Returns a list of 3 dicts: {"title": str, "narrative": str, "risks": [str, ...]}
    """
    prompt = SCENARIO_PROMPT.format(decision=decision, context=context)
    response = _llm.invoke(prompt)

    # TODO(backend): this is the most fragile part of the pipeline — Gemini
    # occasionally wraps JSON in markdown fences despite instructions. Strip
    # them defensively; consider structured output / function calling instead
    # if this breaks demos.
    text = response.content.strip()
    if text.startswith("```"):
        text = text.strip("`")
        text = text.split("\n", 1)[1] if "\n" in text else text
        text = text.rsplit("```", 1)[0] if "```" in text else text

    scenarios = json.loads(text)
    return scenarios[:3]
