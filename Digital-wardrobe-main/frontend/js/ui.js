import { CONFIG } from "./config.js";
import { getLanguage } from "./i18n.js";

let toastTimer = null;

export function qs(selector, root = document) {
  return root.querySelector(selector);
}

export function qsa(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}

export function uid(prefix = "id") {
  if (window.crypto && crypto.randomUUID) {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const locale = getLanguage() === "zh" ? "zh-CN" : "en-US";
  return date.toLocaleDateString(locale, { year: "numeric", month: "short", day: "numeric" });
}

export function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error || new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export function setActiveNav(page) {
  qsa("[data-nav]").forEach((link) => {
    const active = link.dataset.nav === page;
    link.classList.toggle("active", active);
    if (active) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

export function toast(message, type = "info") {
  let host = qs(".toast-host");
  if (!host) {
    host = document.createElement("div");
    host.className = "toast-host";
    document.body.appendChild(host);
  }

  const toastEl = document.createElement("div");
  toastEl.className = `toast toast-${type}`;
  toastEl.textContent = message;
  host.appendChild(toastEl);

  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toastEl.classList.add("hide");
    window.setTimeout(() => toastEl.remove(), 220);
  }, 2400);
}

export function sectionTitle(text, subtitle = "") {
  return `
    <div class="section-title">
      <h2>${escapeHtml(text)}</h2>
      ${subtitle ? `<p>${escapeHtml(subtitle)}</p>` : ""}
    </div>
  `;
}

export function pill(text) {
  return `<span class="pill">${escapeHtml(text)}</span>`;
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function smallButton(label, className = "") {
  return `<button type="button" class="btn btn-ghost ${className}">${escapeHtml(label)}</button>`;
}
