import { analyzeImage } from "./api.js";
import {
  addCanvasItemFromWardrobe,
  deleteWardrobeItem,
  findWardrobeItem,
  getFilters,
  getWardrobeItems,
  getWardrobeStats,
  saveFilters,
  upsertWardrobeItem,
} from "./storage.js";
import { escapeHtml, formatDate, readFileAsDataUrl, setActiveNav, toast, uid } from "./ui.js";
import { t, translateOption } from "./i18n.js";

const CATEGORY_OPTIONS = ["tops", "bottoms", "outerwear", "dress", "shoes", "accessory"];
const SEASON_OPTIONS = ["spring", "summer", "fall", "winter", "all-season"];
const OCCASION_OPTIONS = ["casual", "work", "formal", "sports", "travel", "home"];

export function initWardrobePage() {
  setActiveNav("wardrobe");
  bindForm();
  bindFilters();
  renderAll();
}

function bindForm() {
  const form = document.querySelector("#wardrobe-form");
  const imageInput = document.querySelector("#item-image");
  const preview = document.querySelector("#image-preview");
  const analyzeButton = document.querySelector("#analyze-image-btn");
  const cancelButton = document.querySelector("#cancel-edit-btn");

  imageInput?.addEventListener("change", async () => {
    const file = imageInput.files?.[0];
    if (!file) {
      preview.innerHTML = "";
      preview.dataset.dataUrl = "";
      return;
    }
    const dataUrl = await readFileAsDataUrl(file);
    preview.innerHTML = `<img src="${dataUrl}" alt="preview" />`;
    preview.dataset.dataUrl = dataUrl;
  });

  analyzeButton?.addEventListener("click", async () => {
    const file = imageInput?.files?.[0];
    if (!file) {
      toast(t("wardrobe.chooseImageFirst"), "error");
      return;
    }
    const dataUrl = await readFileAsDataUrl(file);
    analyzeButton.disabled = true;
    analyzeButton.textContent = t("wardrobe.analyzing");
    try {
      const response = await analyzeImage({
        imageBase64: dataUrl,
        filename: file.name,
      });
      applyAnalysisToForm(response.item || {});
      if (response.item?.notes) {
        document.querySelector("#item-notes").value = response.item.notes;
      }
      toast(t("wardrobe.itemAnalyzed"), "success");
    } catch (error) {
      toast(`${t("common.requestFailed")}: ${error.message}`, "error");
    } finally {
      analyzeButton.disabled = false;
      analyzeButton.textContent = t("wardrobe.analyzeImage");
    }
  });

  cancelButton?.addEventListener("click", () => clearForm());

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const item = collectFormData();
    upsertWardrobeItem(item);
    clearForm();
    renderAll();
    toast(t("wardrobe.saved"), "success");
  });
}

function bindFilters() {
  ["#filter-category", "#filter-color", "#filter-season", "#filter-occasion"].forEach((selector) => {
    document.querySelector(selector)?.addEventListener("change", (event) => {
      const key = selector.replace("#filter-", "");
      saveFilters({ [key]: event.target.value });
      renderWardrobe();
    });
  });
}

function renderAll() {
  renderStats();
  renderFilters();
  renderWardrobe();
}

function renderStats() {
  const stats = getWardrobeStats();
  const host = document.querySelector("#wardrobe-stats");
  if (!host) return;
  host.innerHTML = `
    <div class="stats-grid compact">
      <div class="stat-card"><strong>${stats.total}</strong><span>${escapeHtml(t("wardrobe.statsTotal"))}</span></div>
      <div class="stat-card"><strong>${Object.keys(stats.categories).length}</strong><span>${escapeHtml(t("wardrobe.statsCategories"))}</span></div>
      <div class="stat-card"><strong>${Object.keys(stats.colors).length}</strong><span>${escapeHtml(t("wardrobe.statsColors"))}</span></div>
      <div class="stat-card"><strong>${Object.keys(stats.occasions).length}</strong><span>${escapeHtml(t("wardrobe.statsOccasions"))}</span></div>
    </div>
  `;
}

function renderFilters() {
  const state = getFilters();
  const items = getWardrobeItems();
  fillSelect("#filter-category", ["all", ...unique(items.map((item) => item.category)), ...CATEGORY_OPTIONS], state.category || "all", "category");
  fillSelect("#filter-color", ["all", ...unique(items.map((item) => item.color))], state.color || "all", "color");
  fillSelect("#filter-season", ["all", ...unique(items.map((item) => item.season)), ...SEASON_OPTIONS], state.season || "all", "season");
  fillSelect("#filter-occasion", ["all", ...unique(items.map((item) => item.occasion)), ...OCCASION_OPTIONS], state.occasion || "all", "occasion");
}

function renderWardrobe() {
  const grid = document.querySelector("#wardrobe-grid");
  if (!grid) return;

  const state = getFilters();
  const items = getWardrobeItems().filter((item) => {
    return (
      matchesFilter(item.category, state.category) &&
      matchesFilter(item.color, state.color) &&
      matchesFilter(item.season, state.season) &&
      matchesFilter(item.occasion, state.occasion)
    );
  });

  grid.innerHTML = items.length ? items.map(renderWardrobeCard).join("") : `<div class="empty-state">${escapeHtml(t("wardrobe.empty"))}</div>`;

  grid.querySelectorAll("[data-action='edit']").forEach((button) => {
    button.addEventListener("click", () => {
      const item = findWardrobeItem(button.dataset.id);
      if (item) fillForm(item);
    });
  });

  grid.querySelectorAll("[data-action='delete']").forEach((button) => {
    button.addEventListener("click", () => {
      const item = findWardrobeItem(button.dataset.id);
      if (!item) return;
      if (window.confirm(t("wardrobe.deleteConfirm", { name: item.name }))) {
        deleteWardrobeItem(item.id);
        renderAll();
        toast(t("wardrobe.deleted"), "success");
      }
    });
  });

  grid.querySelectorAll("[data-action='canvas']").forEach((button) => {
    button.addEventListener("click", () => {
      const item = findWardrobeItem(button.dataset.id);
      if (!item) return;
      addCanvasItemFromWardrobe(item);
      window.location.href = "/tryon.html";
    });
  });
}

function renderWardrobeCard(item) {
  return `
    <article class="wardrobe-card card">
      <div class="card-image">${item.image ? `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" />` : `<div class="image-placeholder">${escapeHtml(t("common.noImage"))}</div>`}</div>
      <div class="card-body">
        <h3>${escapeHtml(item.name || t("common.untitledItem"))}</h3>
        <p>${escapeHtml([translateOption("category", item.category), item.color, translateOption("season", item.season), translateOption("occasion", item.occasion)].filter(Boolean).join(" · "))}</p>
        <p class="muted">${escapeHtml(item.notes || t("wardrobe.noNotes"))}</p>
        <div class="card-meta">${escapeHtml(formatDate(item.createdAt))}</div>
      </div>
      <div class="card-actions">
        <button type="button" class="btn btn-secondary" data-action="canvas" data-id="${escapeHtml(item.id)}">${escapeHtml(t("wardrobe.canvas"))}</button>
        <button type="button" class="btn btn-secondary" data-action="edit" data-id="${escapeHtml(item.id)}">${escapeHtml(t("wardrobe.edit"))}</button>
        <button type="button" class="btn btn-danger" data-action="delete" data-id="${escapeHtml(item.id)}">${escapeHtml(t("wardrobe.delete"))}</button>
      </div>
    </article>
  `;
}

function collectFormData() {
  const image = document.querySelector("#image-preview")?.dataset.dataUrl || "";
  const id = document.querySelector("#item-id").value || uid("item");
  return {
    id,
    name: document.querySelector("#item-name").value.trim(),
    category: document.querySelector("#item-category").value,
    color: document.querySelector("#item-color").value.trim(),
    season: document.querySelector("#item-season").value,
    occasion: document.querySelector("#item-occasion").value,
    image,
    notes: document.querySelector("#item-notes").value.trim(),
    createdAt: document.querySelector("#item-created-at").value || undefined,
  };
}

function fillForm(item) {
  document.querySelector("#item-id").value = item.id;
  document.querySelector("#item-name").value = item.name;
  document.querySelector("#item-category").value = item.category;
  document.querySelector("#item-color").value = item.color;
  document.querySelector("#item-season").value = item.season;
  document.querySelector("#item-occasion").value = item.occasion;
  document.querySelector("#item-notes").value = item.notes || "";
  document.querySelector("#item-created-at").value = item.createdAt || "";
  document.querySelector("#save-item-btn").textContent = t("wardrobe.updateItem");
  const preview = document.querySelector("#image-preview");
  preview.dataset.dataUrl = item.image || "";
  preview.innerHTML = item.image ? `<img src="${escapeHtml(item.image)}" alt="preview" />` : "";
}

function clearForm() {
  const form = document.querySelector("#wardrobe-form");
  form?.reset();
  document.querySelector("#item-id").value = "";
  document.querySelector("#item-created-at").value = "";
  document.querySelector("#save-item-btn").textContent = t("wardrobe.saveItem");
  const preview = document.querySelector("#image-preview");
  preview.dataset.dataUrl = "";
  preview.innerHTML = "";
}

function applyAnalysisToForm(item) {
  if (item.name) document.querySelector("#item-name").value = item.name;
  if (item.category) document.querySelector("#item-category").value = item.category;
  if (item.color) document.querySelector("#item-color").value = item.color;
  if (item.season) document.querySelector("#item-season").value = item.season;
  if (item.occasion) document.querySelector("#item-occasion").value = item.occasion;
  if (item.notes) document.querySelector("#item-notes").value = item.notes;
}

function fillSelect(selector, values, currentValue, type) {
  const select = document.querySelector(selector);
  if (!select) return;
  const uniqueValues = unique(values.filter(Boolean));
  select.innerHTML = uniqueValues
    .map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(optionLabel(type, value))}</option>`)
    .join("");
  if (!uniqueValues.includes(currentValue)) {
    select.innerHTML = `<option value="${escapeHtml(currentValue)}">${escapeHtml(optionLabel(type, currentValue))}</option>` + select.innerHTML;
  }
  select.value = currentValue;
}

function optionLabel(type, value) {
  if (!value || value === "all") {
    return t("wardrobe.option.all");
  }
  return translateOption(type, value, value);
}

function unique(values) {
  return Array.from(new Set(values));
}

function matchesFilter(value, filterValue) {
  if (!filterValue || filterValue === "all") return true;
  return String(value || "").toLowerCase() === String(filterValue || "").toLowerCase();
}


