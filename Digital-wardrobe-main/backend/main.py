from __future__ import annotations

import base64
import json
from typing import Any

from fastapi import FastAPI, File, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from backend.config import load_settings
from backend.models import AnalyzeImageRequest, AnalyzeImageResponse, HealthResponse, ProviderInfo, ProviderTestRequest, ProviderTestResponse, SuggestOutfitRequest, SuggestOutfitResponse
from backend.providers.factory import ProviderBundle, build_provider_bundle


settings = load_settings()
provider_bundle: ProviderBundle = build_provider_bundle(settings)

app = FastAPI(title="ClosetAI", version=settings.version)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

FRONTEND_DIR = settings.frontend_dir
if FRONTEND_DIR.exists():
    for mount_point, folder_name in [("/js", "js"), ("/css", "css"), ("/assets", "assets")]:
        mount_path = FRONTEND_DIR / folder_name
        if mount_path.exists():
            app.mount(mount_point, StaticFiles(directory=mount_path), name=folder_name)


@app.get("/api/health", response_model=HealthResponse)
async def api_health() -> HealthResponse:
    return HealthResponse(activeProvider=_provider_info(provider_bundle.active))


@app.get("/api/providers")
async def api_providers() -> dict[str, Any]:
    return {
        "activeProviderId": provider_bundle.active.id,
        "fallbackOrder": provider_bundle.fallback_order,
        "providers": [
            {
                **info,
                "active": info["id"] == provider_bundle.active.id,
            }
            for info in provider_bundle.list_info()
        ],
    }


@app.post("/api/analyze-image", response_model=AnalyzeImageResponse)
async def api_analyze_image(request: Request, file: UploadFile | None = File(default=None)) -> AnalyzeImageResponse:
    payload = await _parse_analyze_request(request, file)
    request_model = AnalyzeImageRequest.model_validate(payload)
    provider = provider_bundle.active
    try:
        result = await provider.analyze_image(request_model.model_dump())
        return AnalyzeImageResponse(
            provider=result.provider,
            model=result.model,
            confidence=float(result.payload.get("confidence", 0.8)),
            item=result.payload.get("item", {}),
            raw=result.raw,
        )
    except Exception as exc:
        fallback = provider_bundle.providers["mock"]
        result = await fallback.analyze_image(request_model.model_dump())
        return AnalyzeImageResponse(
            provider=result.provider,
            model=result.model,
            confidence=float(result.payload.get("confidence", 0.8)),
            item=result.payload.get("item", {}),
            raw={"fallbackFrom": provider.id, "error": str(exc), **(result.raw or {})},
        )


@app.post("/api/suggest-outfit", response_model=SuggestOutfitResponse)
async def api_suggest_outfit(payload: SuggestOutfitRequest) -> SuggestOutfitResponse:
    provider = provider_bundle.active
    try:
        result = await provider.suggest_outfit(payload.model_dump())
        return SuggestOutfitResponse(
            provider=result.provider,
            model=result.model,
            suggestions=result.payload.get("suggestions", []),
            raw=result.raw,
        )
    except Exception as exc:
        fallback = provider_bundle.providers["mock"]
        result = await fallback.suggest_outfit(payload.model_dump())
        return SuggestOutfitResponse(
            provider=result.provider,
            model=result.model,
            suggestions=result.payload.get("suggestions", []),
            raw={"fallbackFrom": provider.id, "error": str(exc), **(result.raw or {})},
        )


@app.post("/api/provider/test", response_model=ProviderTestResponse)
async def api_provider_test(payload: ProviderTestRequest) -> ProviderTestResponse:
    provider = provider_bundle.providers.get(payload.providerId) if payload.providerId else provider_bundle.active
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")
    try:
        result = await provider.test_prompt(payload.prompt)
        return ProviderTestResponse(
            provider=result.provider,
            model=result.model,
            configured=result.configured,
            message=_summarize_payload(result.payload),
            raw=result.raw,
        )
    except Exception as exc:
        fallback = provider_bundle.providers["mock"]
        result = await fallback.test_prompt(payload.prompt)
        return ProviderTestResponse(
            provider=result.provider,
            model=result.model,
            configured=True,
            message=_summarize_payload(result.payload),
            raw={"fallbackFrom": provider.id if provider else None, "error": str(exc), **(result.raw or {})},
        )


@app.get("/", include_in_schema=False)
async def root() -> FileResponse:
    return _serve_html("index.html")


@app.get("/{page}.html", include_in_schema=False)
async def page_route(page: str) -> FileResponse:
    return _serve_html(f"{page}.html")


def _provider_info(provider) -> ProviderInfo:
    return ProviderInfo(
        id=provider.id,
        label=provider.label,
        configured=provider.configured,
        defaultModel=provider.model or ("mock" if provider.id == "mock" else ""),
        supportsVision=provider.supports_vision,
        baseUrl=getattr(provider.settings, "base_url", ""),
    )


async def _parse_analyze_request(request: Request, file: UploadFile | None) -> dict[str, Any]:
    content_type = request.headers.get("content-type", "")
    if file is not None or "multipart/form-data" in content_type:
        form = await request.form()
        uploaded = form.get("image")
        image_base64 = None
        filename = None
        if uploaded and hasattr(uploaded, "read"):
            raw = await uploaded.read()
            image_base64 = base64.b64encode(raw).decode("utf-8")
            filename = getattr(uploaded, "filename", None)
        return {
            "imageBase64": image_base64,
            "filename": filename,
            "category": form.get("category"),
            "color": form.get("color"),
            "season": form.get("season"),
            "occasion": form.get("occasion"),
            "notes": form.get("notes"),
            "hints": _safe_json(form.get("hints")),
        }

    try:
        payload = await request.json()
    except Exception:
        payload = {}

    if "image_base64" in payload and "imageBase64" not in payload:
        payload["imageBase64"] = payload.pop("image_base64")
    if "filename" not in payload and "name" in payload:
        payload["filename"] = payload.get("name")
    return payload


def _safe_json(value: Any) -> dict[str, Any]:
    if not value:
        return {}
    if isinstance(value, dict):
        return value
    if isinstance(value, str):
        try:
            parsed = json.loads(value)
            return parsed if isinstance(parsed, dict) else {}
        except Exception:
            return {}
    return {}


def _summarize_payload(payload: dict[str, Any]) -> str:
    if not payload:
        return "Provider responded with an empty payload."
    return json.dumps(payload, ensure_ascii=False)[:500]


def _serve_html(name: str) -> FileResponse:
    file_path = FRONTEND_DIR / name
    if not file_path.exists():
        raise HTTPException(status_code=404, detail=f"Frontend page not found: {name}")
    return FileResponse(file_path)

