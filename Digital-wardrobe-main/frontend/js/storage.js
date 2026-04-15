import { CONFIG } from "./config.js";
import { uid } from "./ui.js";

const DEFAULT_APP_STATE = {
  version: 2,
  items: [],
  draftCanvas: {
    name: "未命名搭配",
    canvasItems: [],
    selectedCanvasItemId: null,
  },
  aiSettings: {
    occasion: "any",
    weather: "any",
    stylePreference: "any",
    colorPreference: "any",
    prompt: "",
  },
  ui: {
    filters: {
      category: "all",
      color: "all",
      season: "all",
      occasion: "all",
    },
  },
};

export function loadAppState() {
  const raw = safeParse(localStorage.getItem(CONFIG.STORAGE_KEY));
  if (!raw) {
    return structuredClone(DEFAULT_APP_STATE);
  }

  if (Array.isArray(raw)) {
    return {
      ...structuredClone(DEFAULT_APP_STATE),
      items: raw.map(normalizeWardrobeItem),
    };
  }

  const migrated = {
    ...structuredClone(DEFAULT_APP_STATE),
    ...raw,
    version: 2,
    items: Array.isArray(raw.items) ? raw.items.map(normalizeWardrobeItem) : [],
    draftCanvas: {
      ...structuredClone(DEFAULT_APP_STATE.draftCanvas),
      ...(raw.draftCanvas || {}),
      canvasItems: Array.isArray(raw.draftCanvas?.canvasItems)
        ? raw.draftCanvas.canvasItems.map(normalizeCanvasItem)
        : [],
    },
    aiSettings: { ...structuredClone(DEFAULT_APP_STATE.aiSettings), ...(raw.aiSettings || {}) },
    ui: {
      ...structuredClone(DEFAULT_APP_STATE.ui),
      ...(raw.ui || {}),
      filters: { ...structuredClone(DEFAULT_APP_STATE.ui.filters), ...(raw.ui?.filters || {}) },
    },
  };

  if (Array.isArray(raw.savedOutfits) && !localStorage.getItem(CONFIG.SAVED_OUTFITS_KEY)) {
    saveSavedOutfits(raw.savedOutfits.map(normalizeSavedOutfit));
  }

  return migrated;
}

export function saveAppState(state) {
  localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(state));
}

export function getWardrobeItems() {
  return loadAppState().items;
}

export function saveWardrobeItems(items) {
  const state = loadAppState();
  state.items = items.map(normalizeWardrobeItem);
  saveAppState(state);
  return state.items;
}

export function upsertWardrobeItem(item) {
  const state = loadAppState();
  const normalized = normalizeWardrobeItem(item);
  const index = state.items.findIndex((entry) => entry.id === normalized.id);
  if (index >= 0) {
    state.items[index] = { ...state.items[index], ...normalized, updatedAt: nowIso() };
  } else {
    state.items.unshift({ ...normalized, createdAt: normalized.createdAt || nowIso(), updatedAt: nowIso() });
  }
  saveAppState(state);
  return state.items;
}

export function deleteWardrobeItem(id) {
  const state = loadAppState();
  state.items = state.items.filter((item) => item.id !== id);
  state.draftCanvas.canvasItems = state.draftCanvas.canvasItems.filter((item) => item.itemId !== id);
  saveAppState(state);
  return state.items;
}

export function updateWardrobeItem(id, patch) {
  const state = loadAppState();
  const index = state.items.findIndex((item) => item.id === id);
  if (index === -1) return null;
  state.items[index] = {
    ...state.items[index],
    ...patch,
    id,
    updatedAt: nowIso(),
  };
  saveAppState(state);
  return state.items[index];
}

export function getFilters() {
  return loadAppState().ui.filters;
}

export function saveFilters(filters) {
  const state = loadAppState();
  state.ui.filters = { ...state.ui.filters, ...filters };
  saveAppState(state);
  return state.ui.filters;
}

export function getDraftCanvas() {
  return loadAppState().draftCanvas;
}

export function saveDraftCanvas(draftCanvas) {
  const state = loadAppState();
  state.draftCanvas = {
    ...structuredClone(DEFAULT_APP_STATE.draftCanvas),
    ...draftCanvas,
    canvasItems: (draftCanvas.canvasItems || []).map(normalizeCanvasItem),
  };
  saveAppState(state);
  return state.draftCanvas;
}

export function clearDraftCanvas() {
  const state = loadAppState();
  state.draftCanvas = structuredClone(DEFAULT_APP_STATE.draftCanvas);
  saveAppState(state);
  return state.draftCanvas;
}

export function getSavedOutfits() {
  return safeParse(localStorage.getItem(CONFIG.SAVED_OUTFITS_KEY), []).map(normalizeSavedOutfit);
}

export function saveSavedOutfits(outfits) {
  localStorage.setItem(CONFIG.SAVED_OUTFITS_KEY, JSON.stringify(outfits.map(normalizeSavedOutfit)));
  return getSavedOutfits();
}

export function upsertSavedOutfit(outfit) {
  const outfits = getSavedOutfits();
  const normalized = normalizeSavedOutfit(outfit);
  const index = outfits.findIndex((entry) => entry.id === normalized.id);
  if (index >= 0) {
    outfits[index] = { ...outfits[index], ...normalized, updatedAt: nowIso() };
  } else {
    outfits.unshift({ ...normalized, createdAt: normalized.createdAt || nowIso(), updatedAt: nowIso() });
  }
  saveSavedOutfits(outfits);
  return outfits;
}

export function deleteSavedOutfit(id) {
  const outfits = getSavedOutfits().filter((outfit) => outfit.id !== id);
  saveSavedOutfits(outfits);
  return outfits;
}

export function findWardrobeItem(id) {
  return getWardrobeItems().find((item) => item.id === id) || null;
}

export function addCanvasItemFromWardrobe(item) {
  const state = loadAppState();
  const zIndex = getMaxCanvasZIndex(state.draftCanvas.canvasItems) + 1;
  const canvasItem = normalizeCanvasItem({
    id: uid("canvas"),
    itemId: item.id,
    x: 0.5,
    y: 0.5,
    width: 0.24,
    height: 0.24,
    rotation: 0,
    zIndex,
  });
  state.draftCanvas.canvasItems.push(canvasItem);
  state.draftCanvas.selectedCanvasItemId = canvasItem.id;
  saveAppState(state);
  return canvasItem;
}

export function updateCanvasItem(id, patch) {
  const state = loadAppState();
  const index = state.draftCanvas.canvasItems.findIndex((item) => item.id === id);
  if (index === -1) return null;
  state.draftCanvas.canvasItems[index] = normalizeCanvasItem({
    ...state.draftCanvas.canvasItems[index],
    ...patch,
    id,
  });
  saveAppState(state);
  return state.draftCanvas.canvasItems[index];
}

export function deleteCanvasItem(id) {
  const state = loadAppState();
  state.draftCanvas.canvasItems = state.draftCanvas.canvasItems.filter((item) => item.id !== id);
  if (state.draftCanvas.selectedCanvasItemId === id) {
    state.draftCanvas.selectedCanvasItemId = null;
  }
  saveAppState(state);
  return state.draftCanvas.canvasItems;
}

export function moveCanvasItemLayer(id, direction) {
  const state = loadAppState();
  const item = state.draftCanvas.canvasItems.find((entry) => entry.id === id);
  if (!item) return null;
  const max = getMaxCanvasZIndex(state.draftCanvas.canvasItems);
  const min = getMinCanvasZIndex(state.draftCanvas.canvasItems);
  if (direction === "forward") {
    item.zIndex = max + 1;
  } else if (direction === "backward") {
    item.zIndex = Math.max(1, min - 1);
  } else if (direction === "front") {
    item.zIndex = max + 10;
  } else if (direction === "back") {
    item.zIndex = 1;
  }
  saveAppState(state);
  return item;
}

export function setSelectedCanvasItemId(id) {
  const state = loadAppState();
  state.draftCanvas.selectedCanvasItemId = id;
  saveAppState(state);
}

export function getSelectedCanvasItem() {
  const state = loadAppState();
  return state.draftCanvas.canvasItems.find((item) => item.id === state.draftCanvas.selectedCanvasItemId) || null;
}

export function getWardrobeStats() {
  const items = getWardrobeItems();
  return {
    total: items.length,
    categories: countBy(items, "category"),
    colors: countBy(items, "color"),
    seasons: countBy(items, "season"),
    occasions: countBy(items, "occasion"),
  };
}

export function normalizeWardrobeItem(item) {
  const createdAt = item.createdAt || nowIso();
  return {
    id: item.id || uid("item"),
    name: item.name || "未命名单品",
    category: item.category || "tops",
    color: item.color || "neutral",
    season: item.season || "all-season",
    occasion: item.occasion || "casual",
    image: item.image || "",
    notes: item.notes || "",
    createdAt,
    updatedAt: item.updatedAt || createdAt,
  };
}

export function normalizeCanvasItem(item) {
  return {
    id: item.id || uid("canvas"),
    itemId: item.itemId,
    x: Number(item.x ?? 0.5),
    y: Number(item.y ?? 0.5),
    width: Number(item.width ?? 0.24),
    height: Number(item.height ?? 0.24),
    rotation: Number(item.rotation ?? 0),
    zIndex: Number(item.zIndex ?? 1),
    locked: Boolean(item.locked ?? false),
    opacity: Number(item.opacity ?? 1),
  };
}

export function normalizeSavedOutfit(outfit) {
  const createdAt = outfit.createdAt || nowIso();
  return {
    id: outfit.id || uid("outfit"),
    name: outfit.name || "未命名搭配",
    canvasItems: Array.isArray(outfit.canvasItems) ? outfit.canvasItems.map(normalizeCanvasItem) : [],
    itemIds: Array.isArray(outfit.itemIds) ? outfit.itemIds : [],
    context: outfit.context || {},
    notes: outfit.notes || "",
    createdAt,
    updatedAt: outfit.updatedAt || createdAt,
  };
}

function safeParse(value, fallback = null) {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function nowIso() {
  return new Date().toISOString();
}

function countBy(items, key) {
  return items.reduce((acc, item) => {
    const value = item[key] || "unknown";
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

function getMaxCanvasZIndex(items) {
  return items.reduce((max, item) => Math.max(max, Number(item.zIndex || 1)), 1);
}

function getMinCanvasZIndex(items) {
  return items.reduce((min, item) => Math.min(min, Number(item.zIndex || 1)), 1);
}
