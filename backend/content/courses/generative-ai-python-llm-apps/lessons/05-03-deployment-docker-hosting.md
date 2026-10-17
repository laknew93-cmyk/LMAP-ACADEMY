An app on localhost is invisible to recruiters. In this lesson you package your invoice extraction service in Docker and deploy it to a platform-as-a-service host such as Render or Railway, with secrets handled properly. The same steps work for your RAG app and Streamlit demos.

## Configuration through environment variables

Production code should read every setting that differs between your laptop and the server from environment variables. You have been doing this since lesson 1.2. Collect them in one place so nothing is scattered:

```python
# config.py
import os

from dotenv import load_dotenv

load_dotenv()  # harmless in production: no .env file there


def require(name: str) -> str:
    value = os.environ.get(name)
    if not value:
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value


ANTHROPIC_API_KEY = require("ANTHROPIC_API_KEY")  # fail fast at startup
CLAUDE_MODEL = os.environ.get("CLAUDE_MODEL", "claude-opus-5-5")
MAX_UPLOAD_MB = int(os.environ.get("MAX_UPLOAD_MB", "10"))
RATE_LIMIT_PER_MIN = int(os.environ.get("RATE_LIMIT_PER_MIN", "10"))
```

Import `config` at the top of `main.py`. **Failing fast** matters: if the key is missing, the app should crash at startup with a clear message, not return confusing errors to the first user an hour later. The SDK client still reads the key from the environment itself; `config` just checks it is there.

## Pin your dependencies

Create `requirements.txt` with versions pinned, so the server installs exactly what you tested:

```bash
pip freeze > requirements.txt
```

Then open the file and delete packages you do not actually use (Jupyter, for example). Smaller images build faster and have fewer security issues.

## The Dockerfile

Docker packages your code, Python version and dependencies into an image that runs the same everywhere. Create `Dockerfile` in the project root:

```dockerfile
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN useradd --create-home appuser
USER appuser

EXPOSE 8000
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
```

Line by line:

- `python:3.12-slim` is a small official Python image.
- `PYTHONUNBUFFERED=1` makes logs appear immediately in the host's log viewer.
- Copying `requirements.txt` and installing **before** copying the code lets Docker cache the slow install step; changing a `.py` file does not reinstall everything.
- `useradd` and `USER` run the app as a non-root user, a basic security practice.
- `--host 0.0.0.0` makes the server reachable from outside the container. The default `127.0.0.1` is a classic "works locally, fails in Docker" bug.
- `${PORT:-8000}` uses the `PORT` variable that hosts like Render and Railway provide, falling back to 8000 locally.

Create `.dockerignore` so secrets and junk never enter the image:

```text
.env
.venv/
__pycache__/
.git/
chroma_db/
*.pdf
```

## Build and run locally

```bash
docker build -t invoice-extractor .
docker run --rm -p 8000:8000 --env-file .env invoice-extractor
```

`--env-file .env` passes your local secrets as environment variables at run time; they are not baked into the image. Open `http://localhost:8000/docs` and test an upload. If it works in Docker locally, it will almost certainly work on the host.

## Deploy to Render or Railway

Both platforms follow the same broad flow (the dashboards change over time, so follow their current docs for exact clicks):

1. Push your project to GitHub. Double-check that `.env` is not in the repository.
2. Create a new web service on the platform and connect the GitHub repository.
3. Choose Docker as the build method (both platforms detect a `Dockerfile`).
4. In the service's **environment variables** settings, add `ANTHROPIC_API_KEY`, `CLAUDE_MODEL` and any other settings. These are stored encrypted and injected at run time.
5. Set the health check path to `/health` if the platform asks.
6. Deploy, watch the build logs, and open the public URL plus `/docs`.

Free and low-cost tiers often sleep when idle, so the first request after a pause can be slow. Mention this in your README so a recruiter does not think your app is broken. Check each platform's current pricing and limits before choosing.

### Deploying the Streamlit or RAG apps

For Streamlit, change the last line of the Dockerfile:

```dockerfile
CMD ["sh", "-c", "streamlit run app.py --server.port ${PORT:-8501} --server.address 0.0.0.0"]
```

For RAG apps with local embeddings, note two things. First, `sentence-transformers` pulls in PyTorch, which makes images large and may exceed small free tiers; an embeddings API is a lighter option in production. Second, container disks on these platforms are usually **ephemeral**: a local `chroma_db` folder is wiped on redeploy. For a demo, run ingestion at startup from documents in the repository; for real use, attach a persistent disk or use a hosted vector store such as PostgreSQL with pgvector.

## Production checklist

| Item | Done? |
|---|---|
| Secrets only in platform environment variables, never in Git or the image | |
| App fails fast if a required variable is missing | |
| `/health` endpoint | |
| Rate limiting and upload size limits enabled | |
| Logs include token usage, with PII redacted | |
| Spend alert or limit set in the provider console | |
| `stop_reason` and API errors handled with friendly messages | |
| README explains what the app does, limits, and cold starts | |

## Try it yourself

About 20 minutes (longer if Docker is new to you):

1. Install Docker Desktop and add `config.py`, `requirements.txt`, `Dockerfile` and `.dockerignore` to your invoice project.
2. Build and run the container locally with `--env-file .env` and test `/docs`.
3. Run `docker run --rm -p 8000:8000 invoice-extractor` without the env file and confirm the app fails fast with your clear error message.
4. Deploy to Render or Railway, setting the environment variables in the dashboard.
5. Test the public URL from your phone on mobile data and note the cold-start time.

## Key takeaways

- Read all configuration from environment variables and fail fast when required ones are missing.
- Pin dependencies and keep images small; install requirements before copying code for faster builds.
- Bind to `0.0.0.0` and the platform's `PORT`, and run as a non-root user.
- Keep secrets out of Git and images with `.gitignore`, `.dockerignore` and platform secret settings.
- Plan for ephemeral disks and cold starts when deploying RAG and demo apps.
