import os

from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY", "")
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")

if not GEMINI_API_KEY:
    print("WARNING: GEMINI_API_KEY is not set. Set it in backend/.env")
if not TAVILY_API_KEY:
    print("WARNING: TAVILY_API_KEY is not set. Set it in backend/.env")
