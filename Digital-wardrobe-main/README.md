# ClosetAI

ClosetAI is a lightweight full-stack digital wardrobe app.

## What it does
- Add, edit, delete, and filter clothing items
- Save wardrobe state in browser `localStorage`
- Build outfits on a free canvas by dragging, resizing, rotating, layering, and deleting items
- Save outfit compositions locally
- Request AI outfit suggestions through a unified backend provider layer
- Default the UI to Simplified Chinese, with a manual English switch
- Use a warm orange and white visual theme across all pages

## Tech stack
- Frontend: vanilla HTML, CSS, and JavaScript
- Backend: FastAPI
- Persistence: browser `localStorage`
- AI: mock provider by default, plus configurable provider adapters in the backend

## Local run
1. Install Python dependencies:

```bash
pip install -r requirements.txt
```

2. Start the app:

```bash
python -m uvicorn backend.main:app --reload --port 8001
```

3. Open:

- [http://localhost:8001/](http://localhost:8001/)

## Pages
- `/` dashboard
- `/wardrobe.html` wardrobe manager
- `/tryon.html` outfit canvas
- `/outfit.html` saved outfits
- `/suggestion.html` AI recommendations and provider status

`tryon.html` is kept for route continuity, but it now serves the outfit canvas editor instead of the old 3D flow.

## API
- `GET /api/health`
- `GET /api/providers`
- `POST /api/analyze-image`
- `POST /api/suggest-outfit`
- `POST /api/provider/test`

## Storage keys
- `closetai_wardrobe`
- `closetai_saved_outfits`
- `closetai_language`

## Provider config
`AI_PROVIDER=mock` is the safe default.

Supported provider ids:
- `mock`
- `openai_compatible`
- `anthropic`
- `qwen`
- `deepseek`
- `kimi`
- `doubao`

Set the matching base URL, API key, and model for the provider you want to use.

## Running tests

```bash
python -m unittest discover -s tests
```

## Known limitations
- Wardrobe and outfit data live only in browser `localStorage`, so there is no cross-device sync.
- Image analysis and outfit suggestions depend on the selected AI provider being configured; `mock` is used automatically when no real provider is set.
- The canvas is a practical V1 editor, not a polished design tool.
- Large images can exhaust browser storage if you upload many of them; thumbnails are a good next improvement.
- English is optional and saved locally; the first load is Simplified Chinese by design.
