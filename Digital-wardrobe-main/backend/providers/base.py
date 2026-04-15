from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Any

from backend.config import ProviderSettings


@dataclass
class ProviderResult:
    provider: str
    model: str
    configured: bool
    payload: dict[str, Any]
    raw: dict[str, Any] | None = None


class ProviderAdapter(ABC):
    def __init__(self, settings: ProviderSettings):
        self.settings = settings

    @property
    def id(self) -> str:
        return self.settings.id

    @property
    def label(self) -> str:
        return self.settings.label

    @property
    def model(self) -> str:
        return self.settings.model

    @property
    def configured(self) -> bool:
        return self.settings.configured

    @property
    def supports_vision(self) -> bool:
        return self.settings.supports_vision

    @abstractmethod
    async def analyze_image(self, payload: dict[str, Any]) -> ProviderResult:
        raise NotImplementedError

    @abstractmethod
    async def suggest_outfit(self, payload: dict[str, Any]) -> ProviderResult:
        raise NotImplementedError

    async def test_prompt(self, prompt: str) -> ProviderResult:
        return await self.suggest_outfit({"prompt": prompt, "testMode": True})

