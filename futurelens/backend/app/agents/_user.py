EDUCATION_READINESS_INSTRUCTION = (
    "\nThis decision is about pursuing higher education (masters / grad school / MBA / PhD).\n"
    "Before recommending going now, weigh the user's readiness on THREE dimensions and let\n"
    "them influence the scenarios directly:\n"
    "1. EXPERIENCE — if the user is a fresher or has less than ~2 years of experience,\n"
    "   seriously consider that gaining industry experience first (2–4 years) usually\n"
    "   leads to better admits, better funding (RA/TA), clearer field selection, and a\n"
    "   sharper career pivot after the masters.\n"
    "2. FINANCIAL READINESS — if the user has an ongoing loan, low savings relative to\n"
    "   the program's cost, or is early in their career, weigh whether stacking more\n"
    "   education debt now (vs. paying down existing loans and saving first) is prudent.\n"
    "3. LIFE CONTEXT — factor in marital status / spouse location if given.\n\n"
    "If ANY of the readiness signals point to 'not yet' (fresher, loan burden, low savings),\n"
    "ONE of the three scenarios MUST be a 'delay N years, gain experience, then apply' path\n"
    "so the user can directly compare going now vs. waiting. Give that scenario a fair,\n"
    "honest score — don't sandbag it.\n"
)

EDUCATION_COLLEGE_INSTRUCTION = (
    "\nThis decision is about pursuing higher education (masters / grad school / MBA / PhD)\n"
    "AND the user has confirmed they want to go ahead — now recommend specifics.\n"
    "For each scenario, name SPECIFIC schools, cities, and U.S. states that fit the user's\n"
    "field of study, budget priority, and family/spouse constraints. Cite concrete tuition\n"
    "figures (annual in USD) where possible, mention typical living cost, and if the user\n"
    "is married or partnered, weigh commute or relocation to the spouse's city.\n"
    "Still respect the readiness signals — if the user is a fresher with a loan, at least\n"
    "one of the school recommendations should be a strong-funding / TA-friendly option.\n"
)


def user_block(
    user: dict | None,
    clarify: dict | None = None,
    decision_context: dict | None = None,
) -> str:
    """Format user details + clarify answers + decision context for prompts."""
    if not user and not clarify and not decision_context:
        return ""
    lines: list[str] = ["About the decision-maker:"]
    if user:
        lines.append(f"- Name: {user.get('name', '')}")
        lines.append(f"- Age: {user.get('age', '')}")
        lines.append(f"- Country: {user.get('location', '')}")
        lines.append(f"- Life stage: {user.get('lifeStage', '')}")
    if clarify:
        for k, v in clarify.items():
            if v is None or str(v).strip() == "":
                continue
            lines.append(f"- {k.replace('_', ' ')}: {v}")
    if decision_context:
        lines.append("Specific to this decision:")
        for k, v in decision_context.items():
            if v is None or str(v).strip() == "":
                continue
            lines.append(f"- {k.replace('_', ' ')}: {v}")
    return "\n".join(lines) + "\n"


def decision_instruction(decision_context: dict | None) -> str:
    """Extra prompt instructions for domain-specific decisions."""
    if not decision_context:
        return ""
    # fieldOfStudy is only sent in stage 2 → user has committed, name colleges.
    if decision_context.get("fieldOfStudy"):
        return EDUCATION_COLLEGE_INSTRUCTION
    # maritalStatus alone signals stage 1 of an education decision.
    if decision_context.get("maritalStatus"):
        return EDUCATION_READINESS_INSTRUCTION
    return ""
