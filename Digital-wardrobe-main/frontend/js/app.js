import { initDashboardPage } from "./dashboard.js";
import { initWardrobePage } from "./wardrobe.js";
import { initOutfitPage, initCanvasPage } from "./canvas.js";
import { initSuggestionPage } from "./suggestion.js";
import { applyTranslations, getLanguage, getPageTitle, setLanguage, t } from "./i18n.js";

document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.page;
  applyTranslations(document);
  if (page) {
    document.title = getPageTitle(page);
  }
  bindLanguageSwitcher();

  if (page === "dashboard") {
    initDashboardPage();
  } else if (page === "wardrobe") {
    initWardrobePage();
  } else if (page === "outfit") {
    initOutfitPage();
  } else if (page === "suggestion") {
    initSuggestionPage();
  } else if (page === "canvas") {
    initCanvasPage();
  }
});

function bindLanguageSwitcher() {
  document.querySelectorAll("[data-lang-option]").forEach((button) => {
    button.addEventListener("click", () => {
      const nextLanguage = button.dataset.langOption === "en" ? "en" : "zh";
      if (nextLanguage === getLanguage()) return;
      setLanguage(nextLanguage);
      window.location.reload();
    });
  });

  const active = getLanguage();
  document.documentElement.lang = active === "zh" ? "zh-CN" : "en";
  document.body?.setAttribute("data-lang", active);
  document.querySelectorAll("[data-lang-option]").forEach((button) => {
    const selected = button.dataset.langOption === active;
    button.classList.toggle("active", selected);
    button.setAttribute("aria-pressed", selected ? "true" : "false");
    button.title = t("lang.label");
  });
}
