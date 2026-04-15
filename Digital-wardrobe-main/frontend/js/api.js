import { CONFIG } from "./config.js";

async function request(path, options = {}) {
  const response = await fetch(`${CONFIG.API_BASE_URL}${path}`, {
    headers: {
      Accept: "application/json",
      ...(options.body && !(options.body instanceof FormData) ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await response.json() : await response.text();
  if (!response.ok) {
    const detail = typeof data === "string" ? data : data?.detail || JSON.stringify(data);
    throw new Error(detail || `Request failed with ${response.status}`);
  }
  return data;
}

export function getHealth() {
  return request("/health");
}

export function getProviders() {
  return request("/providers");
}

export function analyzeImage(payload) {
  return request("/analyze-image", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function suggestOutfit(payload) {
  return request("/suggest-outfit", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function testProvider(payload) {
  return request("/provider/test", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

