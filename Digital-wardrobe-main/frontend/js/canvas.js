import {
  addCanvasItemFromWardrobe,
  clearDraftCanvas,
  deleteCanvasItem,
  deleteSavedOutfit,
  findWardrobeItem,
  getDraftCanvas,
  getSavedOutfits,
  getWardrobeItems,
  moveCanvasItemLayer,
  saveDraftCanvas,
  setSelectedCanvasItemId,
  updateCanvasItem,
  upsertSavedOutfit,
} from "./storage.js";
import { escapeHtml, formatDate, setActiveNav, toast, uid } from "./ui.js";
import { t } from "./i18n.js";

let activeInteraction = null;

export function initCanvasPage() {
  setActiveNav("canvas");
  bindCanvasControls();
  renderCanvasPage();
}

export function initOutfitPage() {
  setActiveNav("outfit");
  document.querySelector("#open-canvas-btn")?.addEventListener("click", () => {
    window.location.href = "/tryon.html";
  });
  renderOutfitPage();
}

function bindCanvasControls() {
  document.querySelector("#add-first-btn")?.addEventListener("click", () => {
    const item = getWardrobeItems()[0];
    if (!item) {
      toast(t("canvas.addFirstItemHint"), "error");
      return;
    }
    addCanvasItemFromWardrobe(item);
    renderCanvasPage();
  });

  document.querySelector("#save-outfit-btn")?.addEventListener("click", () => saveCurrentOutfit());
  document.querySelector("#clear-canvas-btn")?.addEventListener("click", () => {
    if (window.confirm(t("canvas.clearConfirm"))) {
      clearDraftCanvas();
      renderCanvasPage();
      toast(t("canvas.cleared"), "success");
    }
  });
}

function renderCanvasPage() {
  renderCanvasPalette();
  renderCanvasStage();
  renderSelectedPanel();
  renderDraftName();
}

function renderCanvasPalette() {
  const host = document.querySelector("#canvas-wardrobe-list");
  if (!host) return;
  const items = getWardrobeItems();
  host.innerHTML = items.length
    ? items
        .map(
          (item) => `
            <button type="button" class="palette-item" data-add-id="${escapeHtml(item.id)}">
              ${item.image ? `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name || t("common.untitledItem"))}" />` : `<span class="image-placeholder">${escapeHtml(t("common.noImage"))}</span>`}
              <span>${escapeHtml(item.name || t("common.untitledItem"))}</span>
            </button>
          `,
        )
        .join("")
    : `<div class="empty-state">${escapeHtml(t("canvas.emptyWardrobe"))}</div>`;

  host.querySelectorAll("[data-add-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const item = findWardrobeItem(button.dataset.addId);
      if (!item) return;
      addCanvasItemFromWardrobe(item);
      renderCanvasPage();
      toast(t("canvas.addedToCanvas"), "success");
    });
  });
}

function renderCanvasStage() {
  const stage = document.querySelector("#canvas-stage");
  if (!stage) return;
  const { canvasItems, selectedCanvasItemId } = getDraftCanvas();
  stage.innerHTML = canvasItems.length
    ? canvasItems
        .slice()
        .sort((a, b) => a.zIndex - b.zIndex)
        .map((item) => renderCanvasItem(item, selectedCanvasItemId === item.id))
        .join("")
    : `<div class="empty-canvas">${escapeHtml(t("canvas.emptyCanvas"))}</div>`;

  stage.querySelectorAll("[data-canvas-id]").forEach((el) => {
    const id = el.dataset.canvasId;
    el.addEventListener("pointerdown", (event) => {
      if (event.target.closest("button, .canvas-item-resize, .canvas-item-rotate")) return;
      startInteraction(event, id, "drag");
    });
    el.querySelector(".canvas-item-remove")?.addEventListener("click", (event) => {
      event.stopPropagation();
      deleteCanvasItem(id);
      renderCanvasPage();
      toast(t("canvas.deletedItem"), "success");
    });
    el.querySelector(".canvas-item-resize")?.addEventListener("pointerdown", (event) => {
      event.stopPropagation();
      startInteraction(event, id, "resize");
    });
    el.querySelector(".canvas-item-rotate")?.addEventListener("pointerdown", (event) => {
      event.stopPropagation();
      startInteraction(event, id, "rotate");
    });
    el.querySelector(".canvas-item-select")?.addEventListener("click", (event) => {
      event.stopPropagation();
      setSelectedCanvasItemId(id);
      renderSelectedPanel();
      highlightSelected(stage);
    });
  });

  highlightSelected(stage);
}

function renderCanvasItem(item, selected) {
  const wardrobeItem = findWardrobeItem(item.itemId) || {};
  return `
    <div
      class="canvas-item ${selected ? "selected" : ""}"
      data-canvas-id="${escapeHtml(item.id)}"
      style="left:${item.x * 100}%;top:${item.y * 100}%;width:${item.width * 100}%;height:${item.height * 100}%;z-index:${item.zIndex};transform:translate(-50%, -50%) rotate(${item.rotation}deg);opacity:${item.opacity};"
    >
      <button type="button" class="canvas-item-select" aria-label="${escapeHtml(t("canvas.selectItem"))}"></button>
      <button type="button" class="canvas-item-remove" aria-label="${escapeHtml(t("canvas.removeItem"))}">&times;</button>
      <img src="${escapeHtml(wardrobeItem.image || "")}" alt="${escapeHtml(wardrobeItem.name || t("common.untitledItem"))}" />
      <span class="canvas-item-label">${escapeHtml(wardrobeItem.name || t("common.untitledItem"))}</span>
      <span class="canvas-item-resize" aria-hidden="true"></span>
      <span class="canvas-item-rotate" aria-hidden="true"></span>
    </div>
  `;
}

function renderSelectedPanel() {
  const host = document.querySelector("#canvas-selected-panel");
  if (!host) return;
  const selected = getSelectedItem();
  if (!selected) {
    host.innerHTML = `<div class="empty-state">${escapeHtml(t("common.noSelection"))}</div>`;
    return;
  }

  host.innerHTML = `
    <div class="selected-summary">
      <strong>${escapeHtml(selected.label || t("common.untitledItem"))}</strong>
      <p>${escapeHtml(selected.item.name || t("common.untitledItem"))}</p>
    </div>
    <label class="field">${escapeHtml(t("canvas.positionX"))}<input id="canvas-x" type="number" step="0.01" min="0" max="1" value="${selected.item.x}"></label>
    <label class="field">${escapeHtml(t("canvas.positionY"))}<input id="canvas-y" type="number" step="0.01" min="0" max="1" value="${selected.item.y}"></label>
    <label class="field">${escapeHtml(t("canvas.width"))}<input id="canvas-width" type="number" step="0.01" min="0.05" max="1" value="${selected.item.width}"></label>
    <label class="field">${escapeHtml(t("canvas.height"))}<input id="canvas-height" type="number" step="0.01" min="0.05" max="1" value="${selected.item.height}"></label>
    <label class="field">${escapeHtml(t("canvas.rotation"))}<input id="canvas-rotation" type="number" step="1" value="${selected.item.rotation}"></label>
    <div class="button-row">
      <button type="button" class="btn btn-secondary" id="layer-back-btn">${escapeHtml(t("canvas.back"))}</button>
      <button type="button" class="btn btn-secondary" id="layer-backward-btn">${escapeHtml(t("canvas.down"))}</button>
      <button type="button" class="btn btn-secondary" id="layer-forward-btn">${escapeHtml(t("canvas.up"))}</button>
      <button type="button" class="btn btn-secondary" id="layer-front-btn">${escapeHtml(t("canvas.front"))}</button>
    </div>
    <div class="button-row">
      <button type="button" class="btn btn-secondary" id="canvas-duplicate-btn">${escapeHtml(t("canvas.duplicate"))}</button>
      <button type="button" class="btn btn-danger" id="delete-canvas-item-btn">${escapeHtml(t("canvas.delete"))}</button>
    </div>
  `;
  bindSelectedControls();
}

function renderDraftName() {
  const draft = getDraftCanvas();
  const input = document.querySelector("#canvas-name-input");
  if (input) {
    input.value = resolveDisplayName(draft.name, t("canvas.defaultName"));
  }
}

function renderOutfitPage() {
  const host = document.querySelector("#saved-outfits-list");
  if (!host) return;
  const outfits = getSavedOutfits();
  host.innerHTML = outfits.length
    ? outfits.map((outfit) => renderSavedOutfitCard(outfit)).join("")
    : `<div class="empty-state">${escapeHtml(t("canvas.noSavedOutfits"))}</div>`;

  host.querySelectorAll("[data-load-outfit]").forEach((button) => {
    button.addEventListener("click", () => {
      const outfit = getSavedOutfits().find((entry) => entry.id === button.dataset.loadOutfit);
      if (!outfit) return;
      saveDraftCanvas({
        name: outfit.name,
        canvasItems: outfit.canvasItems,
        selectedCanvasItemId: outfit.canvasItems[0]?.id || null,
      });
      window.location.href = "/tryon.html";
    });
  });

  host.querySelectorAll("[data-delete-outfit]").forEach((button) => {
    button.addEventListener("click", () => {
      deleteSavedOutfit(button.dataset.deleteOutfit);
      renderOutfitPage();
      toast(t("canvas.deletedOutfit"), "success");
    });
  });
}

function renderSavedOutfitCard(outfit) {
  const items = outfit.canvasItems
    .map((entry) => findWardrobeItem(entry.itemId)?.name || t("common.untitledItem"))
    .slice(0, 4)
    .join(", ");
  return `
    <article class="saved-outfit card">
      <div class="card-body">
        <h3>${escapeHtml(resolveDisplayName(outfit.name, t("common.untitledOutfit")))}</h3>
        <p>${escapeHtml(items || t("common.noItems"))}</p>
        <p class="muted">${escapeHtml(formatDate(outfit.updatedAt))}</p>
      </div>
      <div class="card-actions">
        <button type="button" class="btn btn-secondary" data-load-outfit="${escapeHtml(outfit.id)}">${escapeHtml(t("canvas.load"))}</button>
        <button type="button" class="btn btn-danger" data-delete-outfit="${escapeHtml(outfit.id)}">${escapeHtml(t("canvas.delete"))}</button>
      </div>
    </article>
  `;
}

function bindSelectedControls() {
  document.querySelector("#canvas-duplicate-btn")?.addEventListener("click", duplicateSelected);
  document.querySelector("#delete-canvas-item-btn")?.addEventListener("click", removeSelected);
  document.querySelector("#layer-forward-btn")?.addEventListener("click", () => nudgeLayer("forward"));
  document.querySelector("#layer-backward-btn")?.addEventListener("click", () => nudgeLayer("backward"));
  document.querySelector("#layer-front-btn")?.addEventListener("click", () => nudgeLayer("front"));
  document.querySelector("#layer-back-btn")?.addEventListener("click", () => nudgeLayer("back"));

  ["#canvas-x", "#canvas-y", "#canvas-width", "#canvas-height", "#canvas-rotation"].forEach((selector) => {
    document.querySelector(selector)?.addEventListener("input", syncSelectedFromForm);
  });
}

function getSelectedItem() {
  const draft = getDraftCanvas();
  const item = draft.canvasItems.find((entry) => entry.id === draft.selectedCanvasItemId);
  if (!item) return null;
  const wardrobeItem = findWardrobeItem(item.itemId) || { name: t("common.untitledItem") };
  return { item, label: wardrobeItem.name };
}

function highlightSelected(stage) {
  const selectedId = getDraftCanvas().selectedCanvasItemId;
  stage.querySelectorAll(".canvas-item").forEach((el) => {
    el.classList.toggle("selected", el.dataset.canvasId === selectedId);
  });
}

function startInteraction(event, id, mode) {
  const stage = document.querySelector("#canvas-stage");
  const rect = stage.getBoundingClientRect();
  const draft = getDraftCanvas();
  const item = draft.canvasItems.find((entry) => entry.id === id);
  if (!item) return;

  setSelectedCanvasItemId(id);
  renderSelectedPanel();
  highlightSelected(stage);

  activeInteraction = {
    mode,
    id,
    start: { x: event.clientX, y: event.clientY },
    startItem: { ...item },
    rect,
    center: {
      x: rect.left + rect.width * item.x,
      y: rect.top + rect.height * item.y,
    },
    startAngle: angleFromCenter({ x: event.clientX, y: event.clientY }, {
      x: rect.left + rect.width * item.x,
      y: rect.top + rect.height * item.y,
    }),
  };

  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", onPointerUp, { once: true });
}

function onPointerMove(event) {
  if (!activeInteraction) return;
  const { mode, id, start, startItem, rect, center, startAngle } = activeInteraction;
  const deltaX = event.clientX - start.x;
  const deltaY = event.clientY - start.y;

  if (mode === "drag") {
    updateCanvasItem(id, {
      x: clamp(startItem.x + deltaX / rect.width, 0.05, 0.95),
      y: clamp(startItem.y + deltaY / rect.height, 0.05, 0.95),
    });
  } else if (mode === "resize") {
    updateCanvasItem(id, {
      width: clamp(startItem.width + deltaX / rect.width, 0.08, 0.95),
      height: clamp(startItem.height + deltaY / rect.height, 0.08, 0.95),
    });
  } else if (mode === "rotate") {
    const currentAngle = angleFromCenter({ x: event.clientX, y: event.clientY }, center);
    updateCanvasItem(id, {
      rotation: normalizeAngle(startItem.rotation + (currentAngle - startAngle)),
    });
  }
  renderCanvasPage();
}

function onPointerUp() {
  if (!activeInteraction) return;
  activeInteraction = null;
  window.removeEventListener("pointermove", onPointerMove);
  toast(t("canvas.canvasUpdated"), "success");
}

function syncSelectedFromForm() {
  const selected = getSelectedItem();
  if (!selected) return;
  updateCanvasItem(selected.item.id, {
    x: Number(document.querySelector("#canvas-x").value),
    y: Number(document.querySelector("#canvas-y").value),
    width: Number(document.querySelector("#canvas-width").value),
    height: Number(document.querySelector("#canvas-height").value),
    rotation: Number(document.querySelector("#canvas-rotation").value),
  });
  renderCanvasPage();
}

function nudgeLayer(direction) {
  const selected = getSelectedItem();
  if (!selected) return;
  moveCanvasItemLayer(selected.item.id, direction);
  renderCanvasPage();
}

function duplicateSelected() {
  const selected = getSelectedItem();
  if (!selected) return;
  const duplicate = {
    ...selected.item,
    id: uid("canvas"),
    x: clamp(selected.item.x + 0.03, 0.05, 0.95),
    y: clamp(selected.item.y + 0.03, 0.05, 0.95),
    zIndex: selected.item.zIndex + 1,
  };
  const draft = getDraftCanvas();
  draft.canvasItems.push(duplicate);
  draft.selectedCanvasItemId = duplicate.id;
  saveDraftCanvas(draft);
  renderCanvasPage();
}

function removeSelected() {
  const selected = getSelectedItem();
  if (!selected) return;
  deleteCanvasItem(selected.item.id);
  renderCanvasPage();
}

function saveCurrentOutfit() {
  const draft = getDraftCanvas();
  const name = resolveDisplayName(document.querySelector("#canvas-name-input")?.value?.trim() || draft.name, t("canvas.defaultName"));
  const outfit = {
    id: uid("outfit"),
    name,
    canvasItems: draft.canvasItems,
    itemIds: draft.canvasItems.map((entry) => entry.itemId),
    context: {},
    notes: "",
  };
  upsertSavedOutfit(outfit);
  saveDraftCanvas({ ...draft, name });
  toast(t("canvas.saved"), "success");
  renderOutfitPage();
}

function angleFromCenter(point, center) {
  return (Math.atan2(point.y - center.y, point.x - center.x) * 180) / Math.PI;
}

function normalizeAngle(angle) {
  let result = angle % 360;
  if (result < 0) result += 360;
  return result;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function resolveDisplayName(value, fallback) {
  const trimmed = String(value || "").trim();
  if (!trimmed) return fallback;
  if (trimmed === "未命名搭配" || trimmed === "Untitled outfit") return fallback;
  if (trimmed === "未命名单品" || trimmed === "Untitled item") return fallback;
  return trimmed;
}

