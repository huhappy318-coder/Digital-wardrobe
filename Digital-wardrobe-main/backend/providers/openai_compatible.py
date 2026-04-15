from __future__ import annotations

import json
from typing import Any

import httpx

from backend.providers.base import ProviderAdapter, ProviderResult


class OpenAICompatibleProviderAdapter(ProviderAdapter):
    async def analyze_image(self, payload: dict[str, Any]) -> ProviderResult:
        prompt = self._analysis_prompt(payload)
        response_text, raw = await self._post_chat(payload, prompt, vision=True)
        parsed = self._extract_json(response_text)
        item = parsed.get("item") if isinstance(parsed, dict) else None
        confidence = float(parsed.get("confidence", 0.78)) if isinstance(parsed, dict) else 0.78
        if not item:
            item = {
                "name": payload.get("filename") or "Suggested Item",
                "category": payload.get("category") or "tops",
                "color": payload.get("color") or "neutral",
                "season": payload.get("season") or "all-season",
                "occasion": payload.get("occasion") or "casual",
                "notes": response_text.strip()[:200],
            }
        return ProviderResult(
            provider=self.id,
            model=self.model,
            configured=True,
            payload={"confidence": confidence, "item": item},
            raw=raw,
        )

    async def suggest_outfit(self, payload: dict[str, Any]) -> ProviderResult:
        prompt = self._suggestion_prompt(payload)
        response_text, raw = await self._post_chat(payload, prompt, vision=False)
        parsed = self._extract_json(response_text)
        suggestions = parsed.get("suggestions") if isinstance(parsed, dict) else None
        if not suggestions:
            suggestions = [
                {
                    "id": "provider_suggestion_1",
                    "title": "Provider Generated Look",
                    "itemIds": [],
                    "score": 80,
                    "reason": response_text.strip()[:240],
                    "layoutHints": [],
                }
            ]
        return ProviderResult(provider=self.id, model=self.model, configured=True, payload={"suggestions": suggestions}, raw=raw)

    async def _post_chat(self, payload: dict[str, Any], prompt: str, vision: bool) -> tuple[str, dict[str, Any]]:
        url = self.settings.base_url.rstrip("/")
        if not url:
            raise RuntimeError(f"{self.id} provider is missing base_url")
        endpoint = f"{url}/chat/completions"

        messages = [{"role": "system", "content": "You are a wardrobe assistant. Return compact JSON only when possible."}]
        if vision and payload.get("imageBase64"):
            image_url = payload["imageBase64"]
            if not image_url.startswith("data:image"):
                image_url = f"data:image/jpeg;base64,{image_url}"
            messages.append(
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {"type": "image_url", "image_url": {"url": image_url}},
                    ],
                }
            )
        else:
            messages.append({"role": "user", "content": prompt})

        body = {
            "model": self.model,
            "messages": messages,
            "temperature": 0.4,
        }
        headers = {"Authorization": f"Bearer {self.settings.api_key}"}

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(endpoint, headers=headers, json=body)
            response.raise_for_status()
            raw = response.json()

        choices = raw.get("choices") or []
        text = ""
        if choices:
            message = choices[0].get("message") or {}
            text = message.get("content") or ""
        return text, raw

    def _analysis_prompt(self, payload: dict[str, Any]) -> str:
        return (
            "Analyze a wardrobe item image. "
            "Return JSON with keys confidence and item. "
            "item must include name, category, color, season, occasion, notes. "
            f"Use hints: {json.dumps({k: v for k, v in payload.items() if k in ['filename', 'category', 'color', 'season', 'occasion', 'notes', 'hints']}, ensure_ascii=False)}"
        )

    def _suggestion_prompt(self, payload: dict[str, Any]) -> str:
        return (
            "Suggest up to "
            f"{payload.get('limit', 3)} outfit ideas based on wardrobe items and canvas state. "
            "Return JSON with suggestions array. Each suggestion should include id, title, itemIds, score, reason, layoutHints. "
            f"Context: {json.dumps(payload.get('context') or {}, ensure_ascii=False)}"
        )

    def _extract_json(self, text: str) -> dict[str, Any]:
        stripped = text.strip()
        if not stripped:
            return {}
        if stripped.startswith("```"):
            stripped = stripped.strip("`")
            stripped = stripped.replace("json\n", "", 1)
        try:
            return json.loads(stripped)
        except Exception:
            start = stripped.find("{")
            end = stripped.rfind("}")
            if start >= 0 and end > start:
                try:
                    return json.loads(stripped[start : end + 1])
                except Exception:
                    return {}
            return {}

