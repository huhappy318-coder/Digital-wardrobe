from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from pydantic import BaseModel, Field


class WardrobeItem(BaseModel):
    id: str
    name: str
    category: str
    color: str
    season: str
    occasion: str
    image: str | None = None
    notes: str = ""
    createdAt: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class CanvasItem(BaseModel):
    id: str
    itemId: str
    x: float
    y: float
    width: float
    height: float
    rotation: float = 0
    zIndex: int = 1
    locked: bool = False
    opacity: float = 1.0


class OutfitContext(BaseModel):
    weather: str = "any"
    occasion: str = "any"
    userPrompt: str = ""
    colorPreference: str = "any"
    stylePreference: str = "any"


class AnalyzeImageRequest(BaseModel):
    imageBase64: str | None = None
    filename: str | None = None
    category: str | None = None
    color: str | None = None
    season: str | None = None
    occasion: str | None = None
    notes: str | None = None
    hints: dict[str, Any] = Field(default_factory=dict)


class SuggestOutfitRequest(BaseModel):
    wardrobeItems: list[WardrobeItem] = Field(default_factory=list)
    canvasItems: list[CanvasItem] = Field(default_factory=list)
    context: OutfitContext = Field(default_factory=OutfitContext)
    limit: int = 3


class ProviderTestRequest(BaseModel):
    providerId: str | None = None
    prompt: str = "Return a short JSON response for a wardrobe app."


class ProviderInfo(BaseModel):
    id: str
    label: str
    configured: bool
    defaultModel: str
    supportsVision: bool = True
    baseUrl: str = ""


class HealthResponse(BaseModel):
    ok: bool = True
    app: str = "closetai"
    version: str = "2.0.0"
    activeProvider: ProviderInfo


class AnalyzeImageResponse(BaseModel):
    ok: bool = True
    provider: str
    model: str
    confidence: float
    item: dict[str, Any]
    raw: dict[str, Any] | None = None


class SuggestOutfitResponse(BaseModel):
    ok: bool = True
    provider: str
    model: str
    suggestions: list[dict[str, Any]]
    raw: dict[str, Any] | None = None


class ProviderTestResponse(BaseModel):
    ok: bool = True
    provider: str
    model: str
    configured: bool
    message: str
    raw: dict[str, Any] | None = None
