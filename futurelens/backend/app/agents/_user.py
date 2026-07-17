def user_block(user: dict | None) -> str:
    """Format user details into a short block for prompts. Empty string if no user."""
    if not user:
        return ""
    return (
        "About the decision-maker:\n"
        f"- Name: {user.get('name', '')}\n"
        f"- Age: {user.get('age', '')}\n"
        f"- Occupation: {user.get('occupation', '')}\n"
        f"- Location: {user.get('location', '')}\n"
        f"- Life stage: {user.get('lifeStage', '')}\n"
    )
