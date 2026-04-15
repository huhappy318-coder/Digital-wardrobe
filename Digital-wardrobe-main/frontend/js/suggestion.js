import { getProviders, suggestOutfit, testProvider } from "./api.js";
import { getDraftCanvas, getWardrobeItems, saveDraftCanvas } from "./storage.js";
import { escapeHtml, setActiveNav, toast } from "./ui.js";
import { t } from "./i18n.js";

const suggestionCache = new Map();

export function initSuggestionPage() {
  setActiveNav("suggestion");
  bindSuggestionControls();
  renderProviderStatus();
}

function bindSuggestionControls() {
  document.querySelector("#suggestion-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = buildPayload();
    const button = document.querySelector("#generate-suggestion-btn");
    const output = document.querySelector("#suggestion-results");
    button.disabled = true;
    button.textContent = t("common.loading");
    try {
      const response = await suggestOutfit(payload);
      renderSuggestions(response.suggestions || []);
      toast(t("suggestion.generated"), "success");
    } catch (error) {
      output.innerHTML = `<div class="empty-state error-state">${escapeHtml(`${t("common.requestFailed")}: ${error.message}`)}</div>`;
    } finally {
      button.disabled = false;
      button.textContent = t("suggestion.generate");
    }
  });

  document.querySelector("#provider-test-btn")?.addEventListener("click", async () => {
    const button = document.querySelector("#provider-test-btn");
    const output = document.querySelector("#provider-test-result");
    button.disabled = true;
    button.textContent = t("suggestion.providerTesting");
    try {
      const response = await testProvider({ prompt: t("suggestion.fallbackTestPrompt") });
      output.innerHTML = `<pre class="code-block">${escapeHtml(JSON.stringify(response, null, 2))}</pre>`;
    } catch (error) {
      output.innerHTML = `<div class="empty-state error-state">${escapeHtml(`${t("common.requestFailed")}: ${error.message}`)}</div>`;
    } finally {
      button.disabled = false;
      button.textContent = t("suggestion.providerTest");
    }
  });
}

async function renderProviderStatus() {
  const host = document.querySelector("#provider-status");
  if (!host) return;
  try {
    const data = await getProviders();
    host.innerHTML = `
      <div class="provider-list">
        ${data.providers
          .map(
            (provider) => `
              <div class="provider-row ${provider.active ? "active" : ""}">
                <div>
                  <strong>${escapeHtml(provider.label)}</strong>
                  <p>${escapeHtml(provider.id)}</p>
                </div>
                <span class="pill">${escapeHtml(provider.configured ? t("suggestion.providerConfigured") : t("suggestion.providerMissing"))}</span>
              </div>
            `,
          )
          .join("")}
      </div>
    `;
  } catch (error) {
    host.innerHTML = `<div class="empty-state error-state">${escapeHtml(t("suggestion.providerStatusError"))}</div>`;
  }
}

function buildPayload() {
  const wardrobeItems = getWardrobeItems();
  const draft = getDraftCanvas();
  return {
    wardrobeItems,
    canvasItems: document.querySelector("#include-canvas")?.checked ? draft.canvasItems : [],
    context: {
      weather: document.querySelector("#suggestion-weather").value,
      occasion: document.querySelector("#suggestion-occasion").value,
      stylePreference: document.querySelector("#suggestion-style").value,
      colorPreference: document.querySelector("#suggestion-color").value,
      userPrompt: document.querySelector("#suggestion-prompt").value.trim(),
    },
    limit: Number(document.querySelector("#suggestion-limit").value || 3),
  };
}

function renderSuggestions(suggestions) {
  const host = document.querySelector("#suggestion-results");
  if (!host) return;
  suggestionCache.clear();
  host.innerHTML = suggestions.length
    ? suggestions
        .map(
          (suggestion) => `
            <article class="suggestion-card card">
              <div class="card-body">
                <h3>${escapeHtml(suggestion.title || t("common.untitledOutfit"))}</h3>
                <p>${escapeHtml(suggestion.reason || "")}</p>
                <p class="muted">${escapeHtml(`${t("suggestion.resultScore")} ${String(suggestion.score ?? "")}`)}</p>
              </div>
              <div class="card-actions">
                <button type="button" class="btn btn-secondary" data-apply-suggestion-id="${escapeHtml(suggestion.id || suggestion.title || "suggestion")}">${escapeHtml(t("suggestion.apply"))}</button>
              </div>
            </article>
          `,
        )
        .join("")
    : `<div class="empty-state">${escapeHtml(t("suggestion.empty"))}</div>`;

  suggestions.forEach((suggestion) => {
    suggestionCache.set(suggestion.id || suggestion.title || "suggestion", suggestion);
  });

  host.querySelectorAll("[data-apply-suggestion-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const suggestion = suggestionCache.get(button.dataset.applySuggestionId);
      if (!suggestion) return;
      applySuggestionToCanvas(suggestion);
      toast(t("suggestion.applied"), "success");
    });
  });
}

function applySuggestionToCanvas(suggestion) {
  const draft = getDraftCanvas();
  const wardrobeItems = getWardrobeItems();
  const canvasItems = (suggestion.layoutHints || []).map((hint, index) => {
    const source = wardrobeItems.find((item) => item.id === hint.itemId) || wardrobeItems[index];
    return {
      id: hint.id || `suggestion_canvas_${index + 1}`,
      itemId: source?.id,
      x: Number(hint.x ?? 0.5),
      y: Number(hint.y ?? 0.5),
      width: Number(hint.width ?? 0.24),
      height: Number(hint.height ?? 0.24),
      rotation: Number(hint.rotation ?? 0),
      zIndex: Number(hint.zIndex ?? index + 1),
    };
  });

  saveDraftCanvas({
    ...draft,
    name: suggestion.title || draft.name,
    canvasItems,
    selectedCanvasItemId: canvasItems[0]?.id || null,
  });
}
