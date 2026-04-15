const runtimeConfig = window.__CLOSETAI_CONFIG__ || {};

export const CONFIG = Object.freeze({
  APP_NAME: "ClosetAI",
  API_BASE_URL: runtimeConfig.API_BASE_URL || "/api",
  STORAGE_KEY: runtimeConfig.STORAGE_KEY || "closetai_wardrobe",
  SAVED_OUTFITS_KEY: runtimeConfig.SAVED_OUTFITS_KEY || "closetai_saved_outfits",
  LANGUAGE_KEY: runtimeConfig.LANGUAGE_KEY || "closetai_language",
  APP_VERSION: runtimeConfig.APP_VERSION || "2.0.0",
});

window.CLOSETAI_CONFIG = CONFIG;
