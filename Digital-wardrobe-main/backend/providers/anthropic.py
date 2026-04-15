from __future__ import annotations

import json
from typing import Any

import httpx

from backend.providers.base import ProviderAdapter, ProviderResult


class AnthropicProviderAdapter(ProviderAdapter):
    async def analyze_image(self, payload: dict[str, Any]) -> ProviderResult:
        prompt = self._analysis_prompt(payload)
        response_text, raw = await self._post_message(payload, prompt, vision=True)
        parsed = self._extract_json(response_text)
        item = parsed.get("item") if isinstance(parsed, dict) else None
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
            payload={"confidence": float(parsed.get("confidence", 0.78)) if isinstance(parsed, dict) else 0.78, "item": item},
            raw=raw,
        )

    async def suggest_outfit(self, payload: dict[str, Any]) -> ProviderResult:
        prompt = self._suggestion_prompt(payload)
        response_text, raw = await self._post_message(payload, prompt, vision=False)
        parsed = self._extract_json(response_text)
        suggestions = parsed.get("suggestions") if isinstance(parsed, dict) else None
        if not suggestions:
            suggestions = [
                {
                    "id": "anthropic_suggestion_1",
                    "title": "Anthropic Generated Look",
                    "itemIds": [],
                    "score": 79,
                    "reason": response_text.strip()[:240],
                    "layoutHints": [],
                }
            ]
        return ProviderResult(provider=self.id, model=self.model, configured=True, payload={"suggestions": suggestions}, raw=raw)

    async def _post_message(self, payload: dict[str, Any], prompt: str, vision: bool) -> tuple[str, dict[str, Any]]:
        if not self.settings.base_url:
            raise RuntimeError("anthropic provider is missing base_url")
        endpoint = f"{self.settings.base_url.rstrip('/')}/v1/messages"
        content: list[dict[str, Any]] = [{"type": "text", "text": prompt}]
        if vision and payload.get("imageBase64"):
            image_url = payload["imageBase64"]
            if not image_url.startswith("data:image"):
                image_url = f"data:image/jpeg;base64,{image_url}"
            content = [
                {"type": "text", "text": prompt},
                {"type": "image", "source": {"type": "base64", "media_type": "image/jpeg", "data": image_url.split(",", 1)[-1]}},
            ]

        body = {
            "model": self.model,
            "max_tokens": 1024,
            "messages": [{"role": "user", "content": content}],
        }
        headers = {
            "x-api-key": self.settings.api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(endpoint, headers=headers, json=body)
            response.raise_for_status()
            raw = response.json()

        text = ""
        content = raw.get("content") or []
        if content:
            text = content[0].get("text") or ""
        return text, raw

    def _analysis_prompt(self, payload: dict[str, Any]) -> str:
        return (
            "Analyze this wardrobe image and return JSON with keys confidence and item. "
            "item must include name, category, color, season, occasion, notes. "
            f"Hints: {json.dumps(payload, ensure_ascii=False)}"
        )

    def _suggestion_prompt(self, payload: dict[str, Any]) -> str:
        return (
            "Suggest outfit ideas for the wardrobe app and return JSON only. "
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

