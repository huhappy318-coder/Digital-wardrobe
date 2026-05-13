const STORAGE_KEY = 'zhida_wardrobe_v2';

const CATEGORY_OPTIONS = [
  { value: 'top', label: '上衣' },
  { value: 'bottom', label: '下装' },
  { value: 'dress', label: '连衣裙' },
  { value: 'outerwear', label: '外套' },
  { value: 'shoes', label: '鞋履' },
  { value: 'accessory', label: '配饰' },
];

const SEASON_OPTIONS = [
  { value: 'spring', label: '春季' },
  { value: 'summer', label: '夏季' },
  { value: 'autumn', label: '秋季' },
  { value: 'winter', label: '冬季' },
  { value: 'all', label: '全年' },
];

const STYLE_OPTIONS = ['休闲', '通勤', '正式', '运动', '优雅', '街头'];

const LEGACY_CATEGORY_MAP = {
  上衣: 'top',
  裤子: 'bottom',
  下装: 'bottom',
  裙子: 'dress',
  连衣裙: 'dress',
  外套: 'outerwear',
  鞋子: 'shoes',
  鞋履: 'shoes',
  配饰: 'accessory',
  配件: 'accessory',
};

const LEGACY_SEASON_MAP = {
  春: 'spring',
  春季: 'spring',
  夏: 'summer',
  夏季: 'summer',
  秋: 'autumn',
  秋季: 'autumn',
  冬: 'winter',
  冬季: 'winter',
  全年: 'all',
  四季: 'all',
};

function createPlaceholder(label, color = '#E7EEF0') {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="640" height="820" viewBox="0 0 640 820">
      <rect width="640" height="820" rx="40" fill="${color}"/>
      <circle cx="510" cy="110" r="70" fill="#F8C7A3" opacity=".75"/>
      <path d="M190 260c30-72 230-72 260 0l52 230c14 62-32 120-96 120H234c-64 0-110-58-96-120l52-230z" fill="#FFFFFF" opacity=".86"/>
      <text x="320" y="705" text-anchor="middle" font-family="Arial, sans-serif" font-size="44" font-weight="700" fill="#24333A">${label}</text>
    </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

const DEMO_ITEMS = [
  {
    id: 'demo-white-shirt',
    name: '白色短袖衬衫',
    category: 'top',
    color: '白色',
    style: '通勤',
    season: 'summer',
    image: createPlaceholder('衬衫', '#EAF5F4'),
    wornCount: 4,
    lastWorn: new Date(Date.now() - 2 * 86400000).toISOString(),
    addedAt: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
  {
    id: 'demo-denim',
    name: '深蓝直筒牛仔裤',
    category: 'bottom',
    color: '深蓝色',
    style: '休闲',
    season: 'all',
    image: createPlaceholder('牛仔裤', '#DDE8F7'),
    wornCount: 6,
    lastWorn: new Date(Date.now() - 5 * 86400000).toISOString(),
    addedAt: new Date(Date.now() - 18 * 86400000).toISOString(),
  },
  {
    id: 'demo-blazer',
    name: '炭灰轻薄西装',
    category: 'outerwear',
    color: '灰色',
    style: '正式',
    season: 'spring',
    image: createPlaceholder('外套', '#ECE8F4'),
    wornCount: 2,
    lastWorn: new Date(Date.now() - 12 * 86400000).toISOString(),
    addedAt: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
  {
    id: 'demo-sneakers',
    name: '米白低帮运动鞋',
    category: 'shoes',
    color: '米白色',
    style: '休闲',
    season: 'all',
    image: createPlaceholder('鞋履', '#F8EFE4'),
    wornCount: 5,
    lastWorn: new Date(Date.now() - 3 * 86400000).toISOString(),
    addedAt: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
  {
    id: 'demo-scarf',
    name: '苔绿色丝巾',
    category: 'accessory',
    color: '绿色',
    style: '优雅',
    season: 'spring',
    image: createPlaceholder('丝巾', '#E5F1E6'),
    wornCount: 0,
    lastWorn: null,
    addedAt: new Date(Date.now() - 9 * 86400000).toISOString(),
  },
];

function normalizeItem(item) {
  const now = new Date().toISOString();
  const category = LEGACY_CATEGORY_MAP[item.category] || item.category || 'top';
  const season = LEGACY_SEASON_MAP[item.season] || item.season || 'all';

  return {
    id: String(item.id || crypto.randomUUID()),
    name: String(item.name || '未命名单品').trim(),
    category: CATEGORY_OPTIONS.some((option) => option.value === category) ? category : 'top',
    color: String(item.color || '未标注').trim(),
    style: String(item.style || '休闲').trim(),
    season: SEASON_OPTIONS.some((option) => option.value === season) ? season : 'all',
    image: item.image || createPlaceholder(item.name || '单品'),
    wornCount: Number.isFinite(Number(item.wornCount)) ? Number(item.wornCount) : 0,
    lastWorn: item.lastWorn || null,
    addedAt: item.addedAt || now,
  };
}

function readItems() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(stored) ? stored.map(normalizeItem) : [];
  } catch {
    return [];
  }
}

function writeItems(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items.map(normalizeItem)));
}

function migrateLegacyStorage() {
  if (localStorage.getItem(STORAGE_KEY)) {
    return;
  }

  const legacyKeys = ['closetai_wardrobe', 'wardrobe'];
  for (const key of legacyKeys) {
    try {
      const legacy = JSON.parse(localStorage.getItem(key) || '[]');
      if (Array.isArray(legacy) && legacy.length) {
        writeItems(legacy);
        return;
      }
    } catch {
      // Ignore broken legacy data and seed demo data below.
    }
  }

  writeItems(DEMO_ITEMS);
}

function getAllClothing() {
  migrateLegacyStorage();
  return readItems();
}

function addClothing(item) {
  const items = getAllClothing();
  const next = normalizeItem(item);
  items.unshift(next);
  writeItems(items);
  return next;
}

function updateClothing(id, patch) {
  const items = getAllClothing();
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) return null;
  items[index] = normalizeItem({ ...items[index], ...patch, id });
  writeItems(items);
  return items[index];
}

function deleteClothing(id) {
  writeItems(getAllClothing().filter((item) => item.id !== id));
}

function updateWornCount(id) {
  const item = getAllClothing().find((entry) => entry.id === id);
  if (!item) return null;
  return updateClothing(id, {
    wornCount: (item.wornCount || 0) + 1,
    lastWorn: new Date().toISOString(),
  });
}

function searchClothing(query, category = 'all') {
  const normalizedQuery = String(query || '').trim().toLowerCase();
  return getAllClothing().filter((item) => {
    const categoryMatches = category === 'all' || item.category === category;
    const textMatches = !normalizedQuery || [item.name, item.color, item.style, getCategoryLabel(item.category), getSeasonLabel(item.season)]
      .join(' ')
      .toLowerCase()
      .includes(normalizedQuery);
    return categoryMatches && textMatches;
  });
}

function getStats() {
  const items = getAllClothing();
  const categories = Object.fromEntries(CATEGORY_OPTIONS.map((option) => [option.value, 0]));
  items.forEach((item) => {
    categories[item.category] = (categories[item.category] || 0) + 1;
  });

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const thisMonthWornCount = items.reduce((sum, item) => {
    if (!item.lastWorn) return sum;
    return new Date(item.lastWorn) >= monthStart ? sum + (item.wornCount || 0) : sum;
  }, 0);

  return {
    total: items.length,
    categories,
    neverWorn: items.filter((item) => !item.lastWorn || item.wornCount === 0).length,
    thisMonthWornCount,
    mostWorn: items.reduce((max, item) => Math.max(max, item.wornCount || 0), 0),
  };
}

function resetDemoData() {
  writeItems(DEMO_ITEMS);
}

function exportData() {
  return JSON.stringify(getAllClothing(), null, 2);
}

function importData(json) {
  const parsed = JSON.parse(json);
  if (!Array.isArray(parsed)) {
    throw new Error('导入文件必须是数组格式');
  }
  writeItems(parsed);
}

function getCategoryLabel(value) {
  return CATEGORY_OPTIONS.find((option) => option.value === value)?.label || value;
}

function getSeasonLabel(value) {
  return SEASON_OPTIONS.find((option) => option.value === value)?.label || value;
}

function getRandomOutfit(weather = {}) {
  const items = getAllClothing();
  const temp = Number(weather.temp);
  const seasonBias = Number.isFinite(temp)
    ? temp <= 10 ? 'winter' : temp >= 27 ? 'summer' : 'all'
    : 'all';

  const byCategory = (category) => items
    .filter((item) => item.category === category)
    .sort((a, b) => {
      const aSeason = a.season === seasonBias || a.season === 'all' ? 1 : 0;
      const bSeason = b.season === seasonBias || b.season === 'all' ? 1 : 0;
      return bSeason - aSeason || (a.wornCount || 0) - (b.wornCount || 0);
    });

  const outfit = [];
  const top = byCategory('top')[0] || byCategory('dress')[0];
  const bottom = top?.category === 'dress' ? null : byCategory('bottom')[0];
  const outer = temp && temp <= 18 ? byCategory('outerwear')[0] : null;
  const shoes = byCategory('shoes')[0];
  const accessory = byCategory('accessory')[0];

  [top, bottom, outer, shoes, accessory].forEach((item) => {
    if (item && !outfit.some((entry) => entry.id === item.id)) outfit.push(item);
  });

  return outfit.slice(0, 5);
}

migrateLegacyStorage();

window.Storage = {
  CATEGORY_OPTIONS,
  SEASON_OPTIONS,
  STYLE_OPTIONS,
  addClothing,
  updateClothing,
  deleteClothing,
  updateWornCount,
  getAllClothing,
  getStats,
  searchClothing,
  resetDemoData,
  exportData,
  importData,
  getCategoryLabel,
  getSeasonLabel,
  getRandomOutfit,
  createPlaceholder,
};

window.getWardrobe = getAllClothing;
