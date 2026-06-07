import os
from dotenv import load_dotenv

load_dotenv()

class Configuracao:
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")
    PORTA: int = int(os.getenv("PORT", "8000"))
    AMBIENTE: str = os.getenv("AMBIENTE", "desenvolvimento")
