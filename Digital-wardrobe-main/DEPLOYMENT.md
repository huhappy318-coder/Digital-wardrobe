# Deployment Notes

This repo is designed to run cleanly in two simple modes:

## Local development
- Run the FastAPI app from the repository root:

```bash
python -m uvicorn backend.main:app --reload --port 8001
```

- Open `http://localhost:8001/`

## Static frontend
- The HTML/CSS/JS frontend is plain static content under `frontend/`
- It can be hosted by any static file server or CDN
- The frontend only talks to the backend through `/api`

## Backend
- FastAPI serves:
  - `/api/health`
  - `/api/providers`
  - `/api/analyze-image`
  - `/api/suggest-outfit`
  - `/api/provider/test`
- The backend also serves the frontend pages for local convenience

## Environment
- `AI_PROVIDER=mock` is the safest local default
- Add provider-specific API keys and base URLs only when you want a real model provider

