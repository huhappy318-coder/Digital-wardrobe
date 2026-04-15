from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from backend.config import ProviderSettings, Settings
from backend.providers.anthropic import AnthropicProviderAdapter
from backend.providers.base import ProviderAdapter
from backend.providers.mock import MockProviderAdapter
from backend.providers.openai_compatible import OpenAICompatibleProviderAdapter


@dataclass
class ProviderBundle:
    active: ProviderAdapter
    providers: dict[str, ProviderAdapter]
    active_id: str
    fallback_order: list[str]

    def list_info(self) -> list[dict[str, Any]]:
        return [
            {
                "id": provider.id,
                "label": provider.label,
                "configured": provider.configured,
                "defaultModel": provider.model or ("mock" if provider.id == "mock" else ""),
                "supportsVision": provider.supports_vision,
                "baseUrl": getattr(provider.settings, "base_url", ""),
            }
            for provider in self.providers.values()
        ]


def build_provider_bundle(settings: Settings) -> ProviderBundle:
    providers: dict[str, ProviderAdapter] = {}
    for spec in settings.provider_settings():
        providers[spec.id] = _make_adapter(spec)

    active_id = _resolve_active_id(settings, providers)
    fallback_order = [provider_id for provider_id in settings.ai_provider_fallbacks if provider_id in providers]
    if "mock" not in fallback_order:
        fallback_order.append("mock")

    active = _resolve_with_fallback(active_id, fallback_order, providers)
    return ProviderBundle(active=active, providers=providers, active_id=active.id, fallback_order=fallback_order)


def _make_adapter(spec: ProviderSettings) -> ProviderAdapter:
    if spec.id == "mock":
        return MockProviderAdapter(spec)
    if spec.id == "anthropic":
        return AnthropicProviderAdapter(spec)
    if spec.id in {"openai_compatible", "qwen", "deepseek", "kimi", "doubao"}:
        return OpenAICompatibleProviderAdapter(spec)
    return MockProviderAdapter(spec)


def _resolve_active_id(settings: Settings, providers: dict[str, ProviderAdapter]) -> str:
    requested = (settings.ai_provider or "mock").strip()
    if requested in providers:
        return requested
    return "mock"


def _resolve_with_fallback(active_id: str, fallback_order: list[str], providers: dict[str, ProviderAdapter]) -> ProviderAdapter:
    candidates = [active_id, *fallback_order]
    for candidate in candidates:
        provider = providers.get(candidate)
        if provider and provider.configured:
            return provider
    return providers["mock"]

