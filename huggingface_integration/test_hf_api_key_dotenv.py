import os
from pathlib import Path

from dotenv import load_dotenv
import requests


def load_env():
    """
    Loads environment variables from a .env file located in the project root.
    Falls back to existing OS env vars if .env isn't present.
    """
    candidates = [
        Path(__file__).parent / ".env",
        Path.cwd() / ".env",
    ]
    for p in candidates:
        if p.exists():
            load_dotenv(p)
            return
    # Fallback: attempt default dotenv search (works if .env is in cwd)
    load_dotenv()


def get_api_key() -> str:
    api_key = os.environ.get("HF_API_KEY")
    if not api_key or not api_key.strip():
        raise EnvironmentError(
            "❌ HF_API_KEY is not set.\n"
            "Create a .env file in your project root with:\n"
            "HF_API_KEY=your_real_huggingface_key_here"
        )
    return api_key.strip()


def validate_hf_key(api_key: str) -> None:
    """
    Makes a simple authenticated request to confirm the key works.
    Adjust the endpoint if you prefer a different sanity check.
    """
    url = "https://huggingface.co/api/models?limit=1"
    headers = {"Authorization": f"Bearer {api_key}"}

    try:
        r = requests.get(url, headers=headers, timeout=10)
        if r.status_code == 401:
            raise PermissionError("❌ HF API responded 401: invalid key or permissions.")
        r.raise_for_status()
    except requests.exceptions.RequestException as e:
        raise SystemError(f"❌ Request failed: {e}") from e

    data = r.json()
    sample = (data[0].get("modelId") if isinstance(data, list) and data else "Unknown")
    print("✅ HF_API_KEY is valid. API reachable.")
    print(f"Sample model returned: {sample}")


if __name__ == "__main__":
    load_env()
    key = get_api_key()
    validate_hf_key(key)
