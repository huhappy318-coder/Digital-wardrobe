import { getSavedOutfits, getWardrobeItems, getWardrobeStats } from "./storage.js";
import { escapeHtml, formatDate, setActiveNav } from "./ui.js";
import { t, translateOption } from "./i18n.js";

export function initDashboardPage() {
  setActiveNav("dashboard");

  const stats = getWardrobeStats();
  const wardrobe = getWardrobeItems();
  const outfits = getSavedOutfits();

  const statsHost = document.querySelector("#dashboard-stats");
  if (statsHost) {
    statsHost.innerHTML = `
      <div class="stats-grid">
        <div class="stat-card"><strong>${stats.total}</strong><span>${escapeHtml(t("dashboard.statItems"))}</span></div>
        <div class="stat-card"><strong>${Object.keys(stats.categories).length}</strong><span>${escapeHtml(t("dashboard.statCategories"))}</span></div>
        <div class="stat-card"><strong>${outfits.length}</strong><span>${escapeHtml(t("dashboard.statOutfits"))}</span></div>
      </div>
    `;
  }

  const recentItems = document.querySelector("#recent-items");
  if (recentItems) {
    recentItems.innerHTML = wardrobe.slice(0, 4).map(renderMiniItem).join("") || emptyState(t("dashboard.emptyItems"));
  }

  const recentOutfits = document.querySelector("#recent-outfits");
  if (recentOutfits) {
    recentOutfits.innerHTML = outfits.slice(0, 4).map(renderMiniOutfit).join("") || emptyState(t("dashboard.emptyOutfits"));
  }

  document.querySelectorAll("[data-dashboard-link]").forEach((button) => {
    button.addEventListener("click", () => {
      const href = button.dataset.dashboardLink;
      if (href) window.location.href = href;
    });
  });
}

function renderMiniItem(item) {
  const category = translateOption("category", item.category);
  const color = item.color || "";
  const occasion = translateOption("occasion", item.occasion);
  return `
    <article class="mini-row">
      <div>
        <strong>${escapeHtml(resolveDisplayName(item.name, t("common.untitledItem")))}</strong>
        <p>${escapeHtml(t("dashboard.itemSummary", { category, color, occasion }))}</p>
      </div>
      <span class="muted">${escapeHtml(formatDate(item.createdAt))}</span>
    </article>
  `;
}

function renderMiniOutfit(outfit) {
  return `
    <article class="mini-row">
      <div>
        <strong>${escapeHtml(resolveDisplayName(outfit.name, t("common.untitledOutfit")))}</strong>
        <p>${escapeHtml(t("dashboard.outfitSummary", { count: outfit.canvasItems.length }))}</p>
      </div>
      <span class="muted">${escapeHtml(formatDate(outfit.updatedAt))}</span>
    </article>
  `;
}

function emptyState(text) {
  return `<div class="empty-state">${escapeHtml(text)}</div>`;
}

function resolveDisplayName(value, fallback) {
  const trimmed = String(value || "").trim();
  if (!trimmed) return fallback;
  if (trimmed === "未命名搭配" || trimmed === "Untitled outfit") return fallback;
  if (trimmed === "未命名单品" || trimmed === "Untitled item") return fallback;
  return trimmed;
}


