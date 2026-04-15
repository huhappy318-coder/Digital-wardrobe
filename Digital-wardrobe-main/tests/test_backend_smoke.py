from __future__ import annotations

import unittest

from fastapi.testclient import TestClient

from backend.main import app


class BackendSmokeTest(unittest.TestCase):
    def setUp(self) -> None:
        self.client = TestClient(app)

    def test_health_and_provider_routes(self) -> None:
        health = self.client.get("/api/health")
        self.assertEqual(health.status_code, 200)
        data = health.json()
        self.assertTrue(data["ok"])
        self.assertEqual(data["app"], "closetai")

        providers = self.client.get("/api/providers")
        self.assertEqual(providers.status_code, 200)
        provider_data = providers.json()
        self.assertIn("providers", provider_data)
        self.assertGreaterEqual(len(provider_data["providers"]), 1)

    def test_analysis_and_suggestion_fallbacks(self) -> None:
        analyze = self.client.post(
            "/api/analyze-image",
            json={"filename": "white-shirt.png", "category": "tops", "color": "white"},
        )
        self.assertEqual(analyze.status_code, 200)
        analyze_data = analyze.json()
        self.assertIn("item", analyze_data)
        self.assertEqual(analyze_data["item"]["category"], "tops")

        suggest = self.client.post(
            "/api/suggest-outfit",
            json={
                "wardrobeItems": [
                    {"id": "item-1", "name": "White Tee", "category": "tops", "color": "white", "season": "summer", "occasion": "casual"}
                ],
                "canvasItems": [],
                "context": {"occasion": "casual", "weather": "warm", "userPrompt": ""},
                "limit": 2,
            },
        )
        self.assertEqual(suggest.status_code, 200)
        suggest_data = suggest.json()
        self.assertIn("suggestions", suggest_data)
        self.assertGreaterEqual(len(suggest_data["suggestions"]), 1)

    def test_page_routes_serve_html(self) -> None:
        for path in ["/", "/wardrobe.html", "/outfit.html", "/tryon.html", "/suggestion.html"]:
            response = self.client.get(path)
            self.assertEqual(response.status_code, 200, msg=path)
            self.assertIn("text/html", response.headers.get("content-type", ""))


if __name__ == "__main__":
    unittest.main()
