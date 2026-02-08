# Hugging Face API Key Environment Starter

A tiny, drop-in starter to manage your Hugging Face API key via a `.env` file for local development,
verify that the key is present, and test it against the Hugging Face API.

## Quick Start

1. **Create your virtual environment (optional but recommended)**
   ```bash
   python -m venv .venv && source .venv/bin/activate   # macOS/Linux
   # or on Windows PowerShell:
   # python -m venv .venv ; .\.venv\Scripts\Activate.ps1
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Add your key**
   Copy `.env.example` to `.env` and set your real key:
   ```bash
   cp .env.example .env   # macOS/Linux
   # Windows:
   # copy .env.example .env
   ```

   Edit `.env`:
   ```
   HF_API_KEY=your_real_huggingface_key_here
   ```

4. **Run the test**
   ```bash
   python test_hf_api_key_dotenv.py
   ```

   Expected output:
   ```
   ✅ HF_API_KEY is valid. API reachable.
   Sample model returned: <something>
   ```

## Notes

- `.env` is **gitignored** by default to keep secrets out of your repo.
- For production, inject secrets via your platform's secret manager (e.g., Cloudflare, Vercel, AWS, GCP).
- The test script uses a minimal request to `https://huggingface.co/api/models?limit=1` to validate the key.

## Files

- `test_hf_api_key_dotenv.py` – loads `.env`, checks `HF_API_KEY`, and validates it with a simple API call.
- `.env.example` – template for your environment variables.
- `.gitignore` – ignores `.env`, caches, and OS files.
- `requirements.txt` – dependencies (`python-dotenv`, `requests`).
