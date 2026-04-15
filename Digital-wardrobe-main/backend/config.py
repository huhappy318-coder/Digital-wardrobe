from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path

from dotenv import load_dotenv


ROOT_DIR = Path(__file__).resolve().parents[1]
load_dotenv(ROOT_DIR / ".env.local", override=True)
load_dotenv(ROOT_DIR / ".env", override=False)


def _split_csv(value: str | None) -> list[str]:
    if not value:
        return []
    return [part.strip() for part in value.split(",") if part.strip()]


@dataclass(frozen=True)
class ProviderSettings:
    id: str
    label: str
    base_url: str = ""
    api_key: str = ""
    model: str = ""
    supports_vision: bool = True

    @property
    def configured(self) -> bool:
        if self.id == "mock":
            return True
        return bool(self.base_url and self.api_key and self.model)


@dataclass(frozen=True)
class Settings:
    app_name: str = "closetai"
    version: str = "2.0.0"
    api_prefix: str = "/api"
    frontend_dir: Path = ROOT_DIR / "frontend"
    ai_provider: str = "mock"
    ai_provider_fallbacks: list[str] = field(default_factory=lambda: ["mock"])
    anthropic_model: str = "claude-3-5-haiku-latest"
    openai_compatible_model: str = "qwen-plus"
    qwen_model: str = "qwen-plus"
    deepseek_model: str = "deepseek-chat"
    kimi_model: str = "moonshot-v1-8k"
    doubao_model: str = "doubao-pro-4k"
    openai_compatible_base_url: str = ""
    openai_compatible_api_key: str = ""
    anthropic_base_url: str = "https://api.anthropic.com"
    anthropic_api_key: str = ""
    qwen_base_url: str = ""
    qwen_api_key: str = ""
    deepseek_base_url: str = ""
    deepseek_api_key: str = ""
    kimi_base_url: str = ""
    kimi_api_key: str = ""
    doubao_base_url: str = ""
    doubao_api_key: str = ""
    request_timeout: float = 30.0

    def provider_settings(self) -> list[ProviderSettings]:
        return [
            ProviderSettings(id="mock", label="Mock Provider"),
            ProviderSettings(
                id="openai_compatible",
                label="OpenAI Compatible",
                base_url=self.openai_compatible_base_url,
                api_key=self.openai_compatible_api_key,
                model=self.openai_compatible_model,
            ),
            ProviderSettings(
                id="anthropic",
                label="Anthropic",
                base_url=self.anthropic_base_url,
                api_key=self.anthropic_api_key,
                model=self.anthropic_model,
            ),
            ProviderSettings(
                id="qwen",
                label="Qwen Compatible",
                base_url=self.qwen_base_url,
                api_key=self.qwen_api_key,
                model=self.qwen_model,
            ),
            ProviderSettings(
                id="deepseek",
                label="DeepSeek Compatible",
                base_url=self.deepseek_base_url,
                api_key=self.deepseek_api_key,
                model=self.deepseek_model,
            ),
            ProviderSettings(
                id="kimi",
                label="Kimi Compatible",
                base_url=self.kimi_base_url,
                api_key=self.kimi_api_key,
                model=self.kimi_model,
            ),
            ProviderSettings(
                id="doubao",
                label="Doubao Compatible",
                base_url=self.doubao_base_url,
                api_key=self.doubao_api_key,
                model=self.doubao_model,
            ),
        ]


def load_settings() -> Settings:
    return Settings(
        ai_provider=os.getenv("AI_PROVIDER", "mock").strip() or "mock",
        ai_provider_fallbacks=_split_csv(os.getenv("AI_PROVIDER_FALLBACKS", "mock")) or ["mock"],
        openai_compatible_model=os.getenv("AI_OPENAI_COMPATIBLE_MODEL", "qwen-plus"),
        openai_compatible_base_url=os.getenv("AI_OPENAI_COMPATIBLE_BASE_URL", ""),
        openai_compatible_api_key=os.getenv("AI_OPENAI_COMPATIBLE_API_KEY", ""),
        anthropic_model=os.getenv("ANTHROPIC_MODEL", "claude-3-5-haiku-latest"),
        anthropic_base_url=os.getenv("ANTHROPIC_BASE_URL", "https://api.anthropic.com"),
        anthropic_api_key=os.getenv("ANTHROPIC_API_KEY", ""),
        qwen_model=os.getenv("QWEN_MODEL", "qwen-plus"),
        qwen_base_url=os.getenv("QWEN_API_URL", ""),
        qwen_api_key=os.getenv("QWEN_API_KEY", ""),
        deepseek_model=os.getenv("DEEPSEEK_MODEL", "deepseek-chat"),
        deepseek_base_url=os.getenv("DEEPSEEK_API_URL", ""),
        deepseek_api_key=os.getenv("DEEPSEEK_API_KEY", ""),
        kimi_model=os.getenv("KIMI_MODEL", "moonshot-v1-8k"),
        kimi_base_url=os.getenv("KIMI_API_URL", ""),
        kimi_api_key=os.getenv("KIMI_API_KEY", ""),
        doubao_model=os.getenv("DOUBAO_MODEL", "doubao-pro-4k"),
        doubao_base_url=os.getenv("DOUBAO_API_URL", ""),
        doubao_api_key=os.getenv("DOUBAO_API_KEY", ""),
        request_timeout=float(os.getenv("AI_REQUEST_TIMEOUT", "30")),
    )
