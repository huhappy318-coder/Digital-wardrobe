import { CONFIG } from "./config.js";

const STORAGE_KEY = CONFIG.LANGUAGE_KEY || "closetai_language";
const DEFAULT_LANGUAGE = "zh";

const STRINGS = {
  zh: {
    appName: "ClosetAI",
    lang: {
      zh: "中文",
      en: "EN",
      label: "语言",
    },
    nav: {
      home: "首页",
      wardrobe: "衣橱",
      outfit: "搭配",
      canvas: "画布",
      suggestion: "推荐",
    },
    pageTitle: {
      dashboard: "ClosetAI - 数字衣橱",
      wardrobe: "衣橱 - ClosetAI",
      outfit: "已保存搭配 - ClosetAI",
      canvas: "搭配画布 - ClosetAI",
      suggestion: "智能推荐 - ClosetAI",
    },
    dashboard: {
      heroTitle: "数字衣橱",
      heroDesc: "添加衣物，搭配组合，向后端请求穿搭建议。",
      ctaWardrobe: "打开衣橱",
      ctaCanvas: "打开画布",
      ctaSuggestion: "查看推荐",
      recentWardrobe: "最近添加",
      recentWardrobeDesc: "本地衣橱中的最新单品。",
      savedOutfits: "已保存搭配",
      savedOutfitsDesc: "保存到本地的画布组合。",
      statItems: "单品",
      statCategories: "分类",
      statOutfits: "搭配",
      emptyItems: "还没有单品。",
      emptyOutfits: "还没有保存的搭配。",
      itemSummary: "{{category}} · {{color}} · {{occasion}}",
      outfitSummary: "{{count}} 个单品",
    },
    wardrobe: {
      heroTitle: "衣橱管理",
      heroDesc: "添加、编辑、筛选和管理你的衣物。",
      statsTotal: "总数",
      statsCategories: "分类",
      statsColors: "颜色",
      statsOccasions: "场景",
      formTitle: "添加或编辑单品",
      formDesc: "把衣橱核心字段保存在本地。",
      filterTitle: "筛选",
      filterDesc: "按属性浏览衣橱。",
      name: "名称",
      category: "分类",
      color: "颜色",
      season: "季节",
      occasion: "场景",
      image: "图片",
      notes: "备注",
      analyzeImage: "分析图片",
      saveItem: "保存单品",
      updateItem: "更新单品",
      reset: "重置",
      canvas: "加入画布",
      edit: "编辑",
      delete: "删除",
      empty: "没有匹配当前筛选的单品。",
      noNotes: "暂无备注",
      chooseImageFirst: "请先选择一张图片。",
      analyzing: "正在分析...",
      itemAnalyzed: "单品已分析。",
      saved: "单品已保存。",
      deleted: "单品已删除。",
      deleteConfirm: name => `确定删除「${name}」吗？`,
      option: {
        all: "全部",
      },
    },
    outfit: {
      heroTitle: "已保存搭配",
      heroDesc: "查看保存的画布组合，并重新加载到画布中。",
      listTitle: "已保存搭配",
      listDesc: "本地保存的组合记录。",
      openCanvasTitle: "打开画布",
      openCanvasDesc: "进入画布继续编辑当前草稿。",
      openCanvas: "打开画布",
      empty: "还没有保存的搭配。",
      load: "加载",
      delete: "删除",
    },
    canvas: {
      heroTitle: "搭配画布",
      heroDesc: "把衣橱单品拖到空白画布上，自由调整位置、大小、旋转和层级。",
      wardrobeTitle: "衣橱",
      addFirstItem: "先添加一件",
      defaultName: "未命名搭配",
      outfitName: "搭配名称",
      saveOutfit: "保存搭配",
      clear: "清空",
      selectedTitle: "已选单品",
      emptyWardrobe: "先添加衣橱单品。",
      emptyCanvas: "把单品拖到这里。",
      selectHint: "选择一个单品来编辑位置。",
      positionX: "X 位置",
      positionY: "Y 位置",
      width: "宽度",
      height: "高度",
      rotation: "旋转",
      back: "置底",
      down: "下移",
      up: "上移",
      front: "置顶",
      duplicate: "复制",
      delete: "删除",
      selectItem: "选择单品",
      removeItem: "移除单品",
      addedToCanvas: "已添加到画布。",
      deletedItem: "单品已移除。",
      deletedOutfit: "搭配已删除。",
      canvasUpdated: "画布已更新。",
      clearConfirm: "要清空画布吗？",
      cleared: "画布已清空。",
      addFirstItemHint: "请先添加衣橱单品。",
      saved: "搭配已保存。",
      openCanvas: "打开画布",
      load: "加载",
      noSavedOutfits: "还没有保存的搭配。",
    },
    suggestion: {
      heroTitle: "智能推荐",
      heroDesc: "结合衣橱和当前画布，向后端请求搭配建议。",
      providerTitle: "服务状态",
      providerTest: "测试服务",
      providerTesting: "测试中...",
      generateTitle: "生成推荐",
      occasion: "场景",
      weather: "天气",
      style: "风格",
      colorPreference: "颜色偏好",
      limit: "数量",
      prompt: "提示词",
      includeCanvas: "包含当前画布单品",
      generate: "生成推荐",
      empty: "没有返回推荐结果。",
      apply: "应用到画布",
      generated: "已生成推荐。",
      applied: "推荐已应用到画布草稿。",
      fallbackTestPrompt: "返回一个简短的 JSON，包含 hello 和 provider 字段。",
      providerConfigured: "已配置",
      providerMissing: "未配置",
      providerStatusError: "无法读取服务状态。",
      resultScore: "评分",
    },
    common: {
      loading: "加载中...",
      success: "成功",
      error: "出错了",
      info: "提示",
      noImage: "暂无图片",
      noItems: "暂无单品",
      noSavedOutfits: "暂无保存的搭配",
      untitledItem: "未命名单品",
      untitledOutfit: "未命名搭配",
      all: "全部",
      noSelection: "当前未选中单品。",
      dropHere: "把单品拖到这里。",
      delete: "删除",
      edit: "编辑",
      save: "保存",
      cancel: "取消",
      reset: "重置",
      clear: "清空",
      open: "打开",
      analyze: "分析",
      generate: "生成",
      apply: "应用",
      languageChanged: "语言已切换。",
      requestFailed: "请求失败",
      providerMissing: "服务未配置",
    },
    options: {
      category: {
        tops: "上衣",
        bottoms: "下装",
        outerwear: "外套",
        dress: "连衣裙",
        shoes: "鞋子",
        accessory: "配饰",
        "one-piece": "连体单品",
      },
      season: {
        "all-season": "四季",
        spring: "春季",
        summer: "夏季",
        fall: "秋季",
        winter: "冬季",
      },
      occasion: {
        casual: "休闲",
        work: "通勤",
        formal: "正式",
        sports: "运动",
        travel: "旅行",
        home: "居家",
      },
      weather: {
        any: "不限",
        warm: "温暖",
        cool: "凉爽",
        rainy: "雨天",
        cold: "寒冷",
      },
      style: {
        any: "不限",
        minimal: "极简",
        "smart-casual": "商务休闲",
        street: "街头",
        classic: "经典",
      },
      color: {
        any: "不限",
        neutral: "中性色",
        dark: "深色",
        light: "浅色",
        colorful: "彩色",
      },
    },
  },
  en: {
    appName: "ClosetAI",
    lang: { zh: "中文", en: "EN", label: "Language" },
    nav: { home: "Home", wardrobe: "Wardrobe", outfit: "Outfits", canvas: "Canvas", suggestion: "Suggestions" },
    pageTitle: {
      dashboard: "ClosetAI - Digital Wardrobe",
      wardrobe: "Wardrobe - ClosetAI",
      outfit: "Saved Outfits - ClosetAI",
      canvas: "Outfit Canvas - ClosetAI",
      suggestion: "Suggestions - ClosetAI",
    },
    dashboard: {
      heroTitle: "Digital Wardrobe",
      heroDesc: "Add garments, compose outfits, and request recommendations from the backend.",
      ctaWardrobe: "Open wardrobe",
      ctaCanvas: "Open canvas",
      ctaSuggestion: "View suggestions",
      recentWardrobe: "Recent items",
      recentWardrobeDesc: "The latest wardrobe items stored locally.",
      savedOutfits: "Saved outfits",
      savedOutfitsDesc: "Canvas compositions saved on this device.",
      statItems: "Items",
      statCategories: "Categories",
      statOutfits: "Outfits",
      emptyItems: "No items yet.",
      emptyOutfits: "No saved outfits yet.",
      itemSummary: "{{category}} · {{color}} · {{occasion}}",
      outfitSummary: "{{count}} items",
    },
    wardrobe: {
      heroTitle: "Wardrobe",
      heroDesc: "Add, edit, filter, and manage clothing items.",
      statsTotal: "Total",
      statsCategories: "Categories",
      statsColors: "Colors",
      statsOccasions: "Occasions",
      formTitle: "Add or edit item",
      formDesc: "Store the core wardrobe fields locally.",
      filterTitle: "Filters",
      filterDesc: "Browse the wardrobe by attribute.",
      name: "Name",
      category: "Category",
      color: "Color",
      season: "Season",
      occasion: "Occasion",
      image: "Image",
      notes: "Notes",
      analyzeImage: "Analyze image",
      saveItem: "Save item",
      updateItem: "Update item",
      reset: "Reset",
      canvas: "Canvas",
      edit: "Edit",
      delete: "Delete",
      empty: "No clothing items match the current filters.",
      noNotes: "No notes",
      chooseImageFirst: "Choose an image first.",
      analyzing: "Analyzing...",
      itemAnalyzed: "Item analyzed.",
      saved: "Item saved.",
      deleted: "Item deleted.",
      deleteConfirm: name => `Delete ${name}?`,
      option: { all: "All" },
    },
    outfit: {
      heroTitle: "Saved outfits",
      heroDesc: "Review saved canvas compositions and load them back into the canvas.",
      listTitle: "Saved outfits",
      listDesc: "Local canvas compositions.",
      openCanvasTitle: "Open canvas",
      openCanvasDesc: "Jump back into the workspace to continue editing.",
      openCanvas: "Open canvas",
      empty: "No saved outfits yet.",
      load: "Load",
      delete: "Delete",
    },
    canvas: {
      heroTitle: "Outfit Canvas",
      heroDesc: "Drag wardrobe pieces onto a blank canvas, then resize, rotate, reorder, and save the result.",
      wardrobeTitle: "Wardrobe",
      addFirstItem: "Add first item",
      defaultName: "Untitled outfit",
      outfitName: "Outfit name",
      saveOutfit: "Save outfit",
      clear: "Clear",
      selectedTitle: "Selected item",
      emptyWardrobe: "Add wardrobe items first.",
      emptyCanvas: "Drop items here.",
      selectHint: "Select an item to edit its placement.",
      positionX: "X position",
      positionY: "Y position",
      width: "Width",
      height: "Height",
      rotation: "Rotation",
      back: "Back",
      down: "Down",
      up: "Up",
      front: "Front",
      duplicate: "Duplicate",
      delete: "Delete",
      selectItem: "Select item",
      removeItem: "Remove item",
      addedToCanvas: "Added to canvas.",
      deletedItem: "Item removed.",
      deletedOutfit: "Outfit deleted.",
      canvasUpdated: "Canvas updated.",
      clearConfirm: "Clear the canvas?",
      cleared: "Canvas cleared.",
      addFirstItemHint: "Add a wardrobe item first.",
      saved: "Outfit saved.",
      openCanvas: "Open canvas",
      load: "Load",
      noSavedOutfits: "No saved outfits yet.",
    },
    suggestion: {
      heroTitle: "AI Suggestions",
      heroDesc: "Combine wardrobe items and the current canvas to request outfit recommendations.",
      providerTitle: "Provider status",
      providerTest: "Test provider",
      providerTesting: "Testing...",
      generateTitle: "Generate suggestions",
      occasion: "Occasion",
      weather: "Weather",
      style: "Style",
      colorPreference: "Color preference",
      limit: "Limit",
      prompt: "Prompt",
      includeCanvas: "Include current canvas items",
      generate: "Generate suggestions",
      empty: "No suggestions returned.",
      apply: "Apply to canvas",
      generated: "Suggestions generated.",
      applied: "Suggestion applied to canvas draft.",
      fallbackTestPrompt: "Return a short JSON object with hello and provider fields.",
      providerConfigured: "Configured",
      providerMissing: "Missing config",
      providerStatusError: "Unable to load provider status.",
      resultScore: "Score",
    },
    common: {
      loading: "Loading...",
      success: "Success",
      error: "Error",
      info: "Info",
      noImage: "No image",
      noItems: "No items",
      noSavedOutfits: "No saved outfits",
      untitledItem: "Untitled item",
      untitledOutfit: "Untitled outfit",
      all: "All",
      noSelection: "Nothing selected.",
      dropHere: "Drop items here.",
      delete: "Delete",
      edit: "Edit",
      save: "Save",
      cancel: "Cancel",
      reset: "Reset",
      clear: "Clear",
      open: "Open",
      analyze: "Analyze",
      generate: "Generate",
      apply: "Apply",
      languageChanged: "Language changed.",
      requestFailed: "Request failed",
      providerMissing: "Provider not configured",
    },
    options: {
      category: {
        tops: "Tops",
        bottoms: "Bottoms",
        outerwear: "Outerwear",
        dress: "Dress",
        shoes: "Shoes",
        accessory: "Accessory",
        "one-piece": "One-piece",
      },
      season: {
        "all-season": "All season",
        spring: "Spring",
        summer: "Summer",
        fall: "Fall",
        winter: "Winter",
      },
      occasion: {
        casual: "Casual",
        work: "Work",
        formal: "Formal",
        sports: "Sports",
        travel: "Travel",
        home: "Home",
      },
      weather: {
        any: "Any",
        warm: "Warm",
        cool: "Cool",
        rainy: "Rainy",
        cold: "Cold",
      },
      style: {
        any: "Any",
        minimal: "Minimal",
        "smart-casual": "Smart casual",
        street: "Street",
        classic: "Classic",
      },
      color: {
        any: "Any",
        neutral: "Neutral",
        dark: "Dark",
        light: "Light",
        colorful: "Colorful",
      },
    },
  },
};

function getStorageLanguage() {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === "en" ? "en" : DEFAULT_LANGUAGE;
}

export function getLanguage() {
  return getStorageLanguage();
}

export function setLanguage(language) {
  const normalized = language === "en" ? "en" : "zh";
  localStorage.setItem(STORAGE_KEY, normalized);
  return normalized;
}

export function t(key, params = {}) {
  const lang = getStorageLanguage();
  const value = readPath(STRINGS[lang], key) ?? readPath(STRINGS.zh, key) ?? key;
  if (typeof value === "function") {
    return value(params);
  }
  return interpolate(String(value), params);
}

export function applyTranslations(root = document) {
  const lang = getStorageLanguage();
  document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
  document.body?.setAttribute("data-lang", lang);

  root.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.dataset.i18n;
    if (!key) return;
    const value = t(key);
    if (element.tagName === "INPUT" || element.tagName === "TEXTAREA") {
      element.value = value;
    } else {
      element.textContent = value;
    }
  });

  root.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    const key = element.dataset.i18nPlaceholder;
    if (key) element.setAttribute("placeholder", t(key));
  });

  root.querySelectorAll("[data-i18n-title]").forEach((element) => {
    const key = element.dataset.i18nTitle;
    if (key) element.setAttribute("title", t(key));
  });

  root.querySelectorAll("[data-lang-option]").forEach((button) => {
    const active = button.dataset.langOption === lang;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", active ? "true" : "false");
  });
}

export function getPageTitle(page) {
  return t(`pageTitle.${page}`);
}

export function translateOption(group, value, fallback = value) {
  if (!value && value !== 0) return "";
  const key = `options.${group}.${value}`;
  const translated = t(key);
  return translated === key ? String(fallback ?? value) : translated;
}

export function getText(key, params = {}) {
  return t(key, params);
}

function readPath(source, key) {
  return key.split(".").reduce((acc, segment) => (acc && typeof acc === "object" ? acc[segment] : undefined), source);
}

function interpolate(value, params) {
  return value.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const replacement = params[key];
    return replacement === undefined || replacement === null ? "" : String(replacement);
  });
}
