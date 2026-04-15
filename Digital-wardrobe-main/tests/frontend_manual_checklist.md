# Frontend Manual Checklist

Run this after starting `python -m uvicorn backend.main:app --reload --port 8001`.

## Smoke checks
- Open `/` and confirm the dashboard loads.
- Confirm the default language is Simplified Chinese.
- Switch to English with the visible `中文 / EN` toggle, then refresh and confirm the choice persists.
- Confirm the orange and white theme is applied on the dashboard and wardrobe pages.
- Open `/wardrobe.html` and confirm item creation works.
- Upload an image, then try `Analyze image` with `AI_PROVIDER=mock`.
- Add at least two items and confirm the filters update the wardrobe list.
- Open `/tryon.html` and confirm items can be added to the canvas.
- Drag, resize, rotate, reorder, duplicate, and delete a canvas item.
- Save an outfit and confirm it appears on `/outfit.html`.
- Open `/suggestion.html`, generate a suggestion, and apply it to the canvas draft.

## Storage checks
- Confirm wardrobe data is stored under `closetai_wardrobe`.
- Confirm saved outfits are stored under `closetai_saved_outfits`.
- Confirm the language preference is stored under `closetai_language`.
- Refresh the page and confirm both wardrobe and saved outfits persist.
