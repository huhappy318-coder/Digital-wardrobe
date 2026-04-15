# Project Structure

```text
repo-root/
  README.md
  PROJECT_STRUCTURE.md
  requirements.txt
  package.json
  .env.example
  vercel.json

  api/
    index.py

  backend/
    main.py
    config.py
    models.py
    providers/
      base.py
      factory.py
      mock.py
      openai_compatible.py
      anthropic.py

  frontend/
    index.html
    wardrobe.html
    outfit.html
    suggestion.html
    tryon.html
    css/style.css
    js/
      app.js
      api.js
      canvas.js
      config.js
      dashboard.js
      i18n.js
      storage.js
      suggestion.js
      ui.js
      wardrobe.js

  tests/
    test_backend_smoke.py
    frontend_manual_checklist.md
```

Notes:
- `tryon.html` is the outfit canvas route kept for continuity.
- Browser state lives in `localStorage` under `closetai_wardrobe` and `closetai_saved_outfits`.
- The language preference is stored locally under `closetai_language`.
- The backend serves the frontend pages and the API from one FastAPI app in local development.
