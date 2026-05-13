const API_BASE_URL = window.AppConfig?.API_BASE_URL || '/api';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

const colorPalette = {
  黑: '#2B2F32',
  白: '#F6F2EA',
  米: '#E9D8BE',
  灰: '#8B969B',
  蓝: '#4267A5',
  绿: '#3B8B5A',
  红: '#C94A4A',
  粉: '#E88C9A',
  黄: '#D6A436',
  橙: '#D8663F',
  紫: '#70568B',
  棕: '#8B6447',
};

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[char]);
}

function showNotification(message, type = 'info') {
  $$('.notification').forEach((node) => node.remove());
  const node = document.createElement('div');
  node.className = `notification ${type}`;
  node.textContent = message;
  document.body.appendChild(node);
  setTimeout(() => node.remove(), 3200);
}

function formatDate(value) {
  if (!value) return '未记录';
  return new Date(value).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
}

function getColorHex(color = '') {
  const key = Object.keys(colorPalette).find((entry) => color.includes(entry));
  return key ? colorPalette[key] : '#2E8A86';
}

function renderTags(item) {
  return `
    <div class="tag-row">
      <span class="tag teal">${Storage.getCategoryLabel(item.category)}</span>
      <span class="tag">${escapeHtml(item.color)}</span>
      <span class="tag gold">${Storage.getSeasonLabel(item.season)}</span>
    </div>
  `;
}

function clothingCard(item, options = {}) {
  const selected = options.selectedIds?.includes(item.id) ? ' selected' : '';
  return `
    <article class="card clothing-card${selected}" data-id="${escapeHtml(item.id)}">
      <img class="clothing-image" src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}">
      <div class="card-body">
        <p class="card-title">${escapeHtml(item.name)}</p>
        ${renderTags(item)}
        <p class="subtle" style="margin: 12px 0 0;">穿着 ${item.wornCount || 0} 次 · 最近 ${formatDate(item.lastWorn)}</p>
        <div class="inline-actions" style="margin-top: 12px;">
          ${options.selectable ? `<button class="btn btn-small btn-secondary" data-action="select" data-id="${escapeHtml(item.id)}">选择</button>` : ''}
          <button class="btn btn-small btn-ghost" data-action="wear" data-id="${escapeHtml(item.id)}">记录穿着</button>
          <button class="btn btn-small btn-danger" data-action="delete" data-id="${escapeHtml(item.id)}">删除</button>
        </div>
      </div>
    </article>
  `;
}

async function safeFetchJson(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `HTTP ${response.status}`);
  }
  return response.json();
}

function initNavigation() {
  const page = document.body.dataset.page;
  $$('[data-nav]').forEach((link) => {
    if (link.dataset.nav === page) link.classList.add('active');
  });

  const menu = $('#menuButton');
  const mobileNav = $('#mobileNav');
  menu?.addEventListener('click', () => {
    const isOpen = mobileNav.classList.toggle('open');
    menu.setAttribute('aria-expanded', String(isOpen));
  });
}

function initIndexPage() {
  const stats = Storage.getStats();
  $('#totalItems').textContent = stats.total;
  $('#monthWorn').textContent = stats.thisMonthWornCount;
  $('#neverWorn').textContent = stats.neverWorn;
  $('#mostWorn').textContent = stats.mostWorn;
  $('#todayText').textContent = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  const recent = Storage.getAllClothing()
    .filter((item) => item.lastWorn)
    .sort((a, b) => new Date(b.lastWorn) - new Date(a.lastWorn))
    .slice(0, 5);

  const recentNode = $('#recentActivities');
  if (!recent.length) {
    recentNode.innerHTML = '<div class="empty-state">还没有穿着记录。生成一套穿搭后点击“今天就穿这套”，这里会自动更新。</div>';
  } else {
    recentNode.innerHTML = recent.map((item) => `
      <div class="activity-row card">
        <img class="thumb" src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}">
        <div>
          <strong>${escapeHtml(item.name)}</strong>
          <p class="subtle" style="margin: 4px 0 0;">${formatDate(item.lastWorn)} · 累计 ${item.wornCount} 次</p>
        </div>
        <span class="tag teal">${Storage.getCategoryLabel(item.category)}</span>
      </div>
    `).join('');
  }

  $('#resetDemo')?.addEventListener('click', () => {
    Storage.resetDemoData();
    showNotification('示例衣橱已恢复', 'success');
    setTimeout(() => window.location.reload(), 500);
  });
}

let selectedWardrobeIds = [];
let uploadedImage = '';

function fillSelect(select, options, includeAll = false) {
  const allOption = includeAll ? '<option value="all">全部分类</option>' : '';
  select.innerHTML = allOption + options.map((option) => `<option value="${option.value}">${option.label}</option>`).join('');
}

function renderWardrobe() {
  const query = $('#searchInput')?.value || '';
  const category = $('#categoryFilter')?.value || 'all';
  const grid = $('#wardrobeGrid');
  if (!grid) return;

  const items = Storage.searchClothing(query, category);
  $('#wardrobeCount').textContent = `${items.length} 件`;

  if (!items.length) {
    grid.innerHTML = '<div class="empty-state" style="grid-column: 1 / -1;">没有匹配的单品。换个筛选条件，或上传一张衣物照片。</div>';
    return;
  }

  grid.innerHTML = items.map((item) => clothingCard(item, {
    selectable: true,
    selectedIds: selectedWardrobeIds,
  })).join('');
}

function syncSelectedOutfit() {
  const selected = Storage.getAllClothing().filter((item) => selectedWardrobeIds.includes(item.id));
  const node = $('#selectedItems');
  const analyzeButton = $('#analyzeSelection');
  if (!node) return;

  analyzeButton.disabled = selected.length < 2 || selected.length > 5;
  node.innerHTML = selected.length
    ? selected.map((item) => `<span class="tag teal">${escapeHtml(item.name)}</span>`).join('')
    : '<span class="subtle">请选择 2-5 件单品进行搭配分析</span>';
}

function localAnalyzeOutfit(items) {
  const styles = new Set(items.map((item) => item.style));
  const hasShoes = items.some((item) => item.category === 'shoes');
  const hasBase = items.some((item) => ['top', 'dress'].includes(item.category)) && items.some((item) => ['bottom', 'dress'].includes(item.category));
  const colors = items.map((item) => item.color).filter(Boolean);
  let score = 72;
  if (styles.size <= 2) score += 8;
  if (hasShoes) score += 7;
  if (hasBase) score += 8;
  if (colors.length <= 3) score += 5;
  score = Math.min(score, 96);

  return {
    score,
    title: score >= 88 ? '完成度很高的组合' : '可直接出门的实用组合',
    colorAnalysis: `这套搭配主要由 ${colors.slice(0, 3).join('、') || '中性色'} 组成，视觉重心清楚。`,
    pros: [
      styles.size <= 2 ? '风格方向一致' : '风格有层次',
      hasBase ? '上下装结构完整' : '单品主题明确',
      hasShoes ? '鞋履已补齐整体比例' : '可继续补一双鞋增强完整度',
    ],
    cons: [
      colors.length > 3 ? '颜色数量略多，可以减少一个强调色' : '可以加入一个小面积亮点',
      !hasShoes ? '缺少鞋履会影响整套完成度' : '配饰可根据场合再增减',
    ],
    suggestion: '优先保持一个主色、一个辅助色、一个小面积点缀色，照片展示会更干净。',
  };
}

function displayAnalysis(data) {
  $('#analysisResult').classList.remove('hidden');
  $('#analysisResult').innerHTML = `
    <div class="result-box">
      <p class="eyebrow">搭配评分 ${Number(data.score || 80)} / 100</p>
      <h3>${escapeHtml(data.title || '搭配分析')}</h3>
      <p>${escapeHtml(data.colorAnalysis || data.suggestion || '这套搭配结构完整，可以作为日常方案。')}</p>
      <div class="grid grid-2">
        <div>
          <strong>优点</strong>
          <ul>${(data.pros || []).map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
        </div>
        <div>
          <strong>可优化</strong>
          <ul>${(data.cons || []).map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
        </div>
      </div>
      <p><strong>建议：</strong>${escapeHtml(data.suggestion || '保持色彩简洁，按场合调整配饰。')}</p>
    </div>
  `;
}

async function analyzeUploadedImage() {
  if (!uploadedImage) {
    showNotification('请先选择图片', 'error');
    return;
  }

  const button = $('#analyzeImage');
  button.disabled = true;
  button.textContent = '识别中...';
  try {
    const base64 = uploadedImage.split(',')[1] || '';
    const data = await safeFetchJson(`${API_BASE_URL}/analyze-image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_base64: base64 }),
    });
    const parsed = typeof data.content === 'string' ? JSON.parse(data.content.replace(/```json|```/g, '').trim()) : data;
    $('#itemName').value = parsed.name || $('#itemName').value || '新单品';
    $('#itemColor').value = parsed.color || $('#itemColor').value || '未标注';
    $('#itemStyle').value = parsed.style || $('#itemStyle').value || '休闲';
    $('#itemCategory').value = parsed.category || $('#itemCategory').value;
    $('#itemSeason').value = parsed.season || $('#itemSeason').value;
    showNotification(data.success === false ? '已使用本地规则填充识别结果' : '识别完成，请确认后保存', 'success');
  } catch {
    $('#itemName').value = $('#itemName').value || '新上传单品';
    $('#itemColor').value = $('#itemColor').value || '未标注';
    showNotification('AI 识别不可用，已保留图片，可手动填写信息', 'error');
  } finally {
    button.disabled = false;
    button.textContent = '智能识别';
  }
}

function initWardrobePage() {
  fillSelect($('#categoryFilter'), Storage.CATEGORY_OPTIONS, true);
  fillSelect($('#itemCategory'), Storage.CATEGORY_OPTIONS);
  fillSelect($('#itemSeason'), Storage.SEASON_OPTIONS);
  $('#itemStyle').innerHTML = Storage.STYLE_OPTIONS.map((style) => `<option value="${style}">${style}</option>`).join('');

  const uploadZone = $('#uploadZone');
  const fileInput = $('#fileInput');
  uploadZone.addEventListener('click', () => fileInput.click());
  uploadZone.addEventListener('dragover', (event) => {
    event.preventDefault();
    uploadZone.classList.add('dragover');
  });
  uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('dragover'));
  uploadZone.addEventListener('drop', (event) => {
    event.preventDefault();
    uploadZone.classList.remove('dragover');
    handleFile(event.dataTransfer.files?.[0]);
  });
  fileInput.addEventListener('change', (event) => handleFile(event.target.files?.[0]));

  function handleFile(file) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showNotification('请上传 JPG、PNG 或 WEBP 图片', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showNotification('图片超过 5MB，请压缩后再上传', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      uploadedImage = reader.result;
      $('#previewImage').src = uploadedImage;
      $('#previewPanel').classList.remove('hidden');
      $('#itemName').value = file.name.replace(/\.[^.]+$/, '').slice(0, 24);
    };
    reader.readAsDataURL(file);
  }

  $('#analyzeImage').addEventListener('click', analyzeUploadedImage);
  $('#itemForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const name = $('#itemName').value.trim();
    if (!name) {
      showNotification('请填写单品名称', 'error');
      return;
    }
    Storage.addClothing({
      name,
      category: $('#itemCategory').value,
      color: $('#itemColor').value.trim() || '未标注',
      style: $('#itemStyle').value,
      season: $('#itemSeason').value,
      image: uploadedImage || Storage.createPlaceholder(name),
    });
    event.target.reset();
    uploadedImage = '';
    $('#previewPanel').classList.add('hidden');
    renderWardrobe();
    syncSelectedOutfit();
    showNotification('单品已加入衣橱', 'success');
  });

  $('#searchInput').addEventListener('input', renderWardrobe);
  $('#categoryFilter').addEventListener('change', renderWardrobe);
  $('#wardrobeGrid').addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const { action, id } = button.dataset;
    if (action === 'delete') {
      Storage.deleteClothing(id);
      selectedWardrobeIds = selectedWardrobeIds.filter((entry) => entry !== id);
      showNotification('单品已删除', 'success');
    }
    if (action === 'wear') {
      Storage.updateWornCount(id);
      showNotification('穿着次数已记录', 'success');
    }
    if (action === 'select') {
      selectedWardrobeIds = selectedWardrobeIds.includes(id)
        ? selectedWardrobeIds.filter((entry) => entry !== id)
        : [...selectedWardrobeIds, id].slice(-5);
    }
    renderWardrobe();
    syncSelectedOutfit();
  });

  $('#clearSelection').addEventListener('click', () => {
    selectedWardrobeIds = [];
    renderWardrobe();
    syncSelectedOutfit();
  });

  $('#analyzeSelection').addEventListener('click', () => {
    const items = Storage.getAllClothing().filter((item) => selectedWardrobeIds.includes(item.id));
    displayAnalysis(localAnalyzeOutfit(items));
  });

  $('#exportData').addEventListener('click', () => {
    const blob = new Blob([Storage.exportData()], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'wardrobe-data.json';
    link.click();
    URL.revokeObjectURL(url);
  });

  $('#importFile').addEventListener('change', async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      Storage.importData(await file.text());
      renderWardrobe();
      showNotification('衣橱数据已导入', 'success');
    } catch (error) {
      showNotification(error.message || '导入失败', 'error');
    }
  });

  renderWardrobe();
  syncSelectedOutfit();
}

let currentWeather = null;
let currentOutfit = [];

function fallbackWeather(city) {
  return {
    success: false,
    city,
    temp: 23,
    feels_like: 23,
    humidity: 58,
    description: '多云',
  };
}

function renderWeather(data) {
  currentWeather = data;
  $('#weatherCard').classList.remove('hidden');
  $('#weatherCity').textContent = data.city;
  $('#weatherTemp').textContent = `${data.temp}°C`;
  $('#weatherDesc').textContent = data.description;
  $('#weatherMeta').textContent = `体感 ${data.feels_like}°C · 湿度 ${data.humidity}%`;
  $('#generateOutfit').disabled = false;
}

function buildOutfitReason(outfit, weather) {
  const temp = Number(weather?.temp);
  const names = outfit.map((item) => item.name).join('、');
  const tempText = Number.isFinite(temp)
    ? temp <= 10 ? '今天温度偏低，外套和保暖层很关键。'
      : temp >= 27 ? '今天温度偏高，轻薄透气会更舒服。'
        : '今天温度适中，适合层次简洁的搭配。'
    : '这套搭配优先考虑衣橱里的低频单品。';
  return `${tempText} 推荐 ${names}，整体色彩清楚，适合日常通勤或周末出门。`;
}

function renderOutfit(outfit, weather = currentWeather) {
  currentOutfit = outfit;
  const result = $('#outfitResult');
  if (!outfit.length) {
    result.innerHTML = '<div class="empty-state">衣橱里还没有足够的单品。请先添加上衣、下装或鞋履。</div>';
    result.classList.remove('hidden');
    return;
  }
  result.classList.remove('hidden');
  result.innerHTML = `
    <div class="section-head" style="margin-top: 0;">
      <div>
        <p class="eyebrow">今日推荐</p>
        <h2>一套可以直接出门的组合</h2>
      </div>
      <button class="btn btn-ghost" id="regenerateOutfit">换一套</button>
    </div>
    <div class="outfit-preview">${outfit.map((item) => clothingCard(item)).join('')}</div>
    <div class="result-box" style="margin-top: 16px;">
      <h3>搭配理由</h3>
      <p>${escapeHtml(buildOutfitReason(outfit, weather))}</p>
      <p class="subtle">小贴士：如果要拍作品集截图，建议保留 2-3 个主色，背景选择干净纯色。</p>
      <div class="inline-actions">
        <button class="btn btn-primary" id="wearOutfit">今天就穿这套</button>
      </div>
    </div>
  `;
  $('#regenerateOutfit').addEventListener('click', () => renderOutfit(Storage.getRandomOutfit(currentWeather)));
  $('#wearOutfit').addEventListener('click', () => {
    currentOutfit.forEach((item) => Storage.updateWornCount(item.id));
    showNotification('已记录本次穿着', 'success');
  });
}

function initOutfitPage() {
  $('#weatherForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const city = $('#cityInput').value.trim() || '上海';
    const button = $('#weatherSubmit');
    button.disabled = true;
    button.textContent = '查询中...';
    try {
      const data = await safeFetchJson(`${API_BASE_URL}/weather?city=${encodeURIComponent(city)}`);
      renderWeather(data.success ? data : fallbackWeather(city));
      if (!data.success) showNotification('天气服务不可用，已使用演示天气', 'error');
    } catch {
      renderWeather(fallbackWeather(city));
      showNotification('天气查询失败，已使用演示天气', 'error');
    } finally {
      button.disabled = false;
      button.textContent = '查询天气';
    }
  });

  $('#generateOutfit').addEventListener('click', () => renderOutfit(Storage.getRandomOutfit(currentWeather)));
  renderWeather(fallbackWeather('上海'));
}

function buildLocalSuggestions(style, color) {
  const items = Storage.getAllClothing();
  const matched = items.filter((item) => style === 'all' || item.style === style);
  const base = matched.length >= 2 ? matched : items;
  const groups = [
    {
      title: `${style === 'all' ? '日常' : style}胶囊组合`,
      items: Storage.getRandomOutfit({ temp: 22 }).map((item) => item.name),
      tip: '用一件基础上衣配低频下装，再用鞋履统一风格。',
      occasion: '通勤、约会、周末出门',
    },
    {
      title: `${color === 'all' ? '低饱和' : color}配色方案`,
      items: base.slice(0, 4).map((item) => item.name),
      tip: '控制主色数量，配饰只负责强调，不要抢走主体。',
      occasion: '作品集截图、日常穿搭记录',
    },
    {
      title: '唤醒沉睡单品',
      items: items.filter((item) => !item.lastWorn || item.wornCount === 0).slice(0, 3).map((item) => item.name),
      tip: '把长期没穿的单品放在中性色旁边，风险最低。',
      occasion: '衣橱整理、换季搭配',
    },
  ];
  return groups.filter((group) => group.items.length);
}

function renderSuggestions(groups, note = '') {
  $('#suggestionResult').innerHTML = `
    ${note ? `<div class="result-box"><p>${escapeHtml(note)}</p></div>` : ''}
    <div class="suggestion-list">
      ${groups.map((group) => `
        <article class="card suggestion-card">
          <h3>${escapeHtml(group.title)}</h3>
          <p><strong>单品：</strong>${escapeHtml(group.items.join('、'))}</p>
          <p><strong>技巧：</strong>${escapeHtml(group.tip)}</p>
          <p class="subtle">适合：${escapeHtml(group.occasion)}</p>
        </article>
      `).join('')}
    </div>
  `;
}

function initSuggestionPage() {
  $('#stylePreference').innerHTML = '<option value="all">不限风格</option>' + Storage.STYLE_OPTIONS.map((style) => `<option value="${style}">${style}</option>`).join('');
  $('#suggestionForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const style = $('#stylePreference').value;
    const color = $('#colorPreference').value;
    const key = $('#apiKey').value.trim();
    const localGroups = buildLocalSuggestions(style, color);

    if (!Storage.getAllClothing().length) {
      showNotification('请先添加衣橱单品', 'error');
      return;
    }

    if (!key) {
      renderSuggestions(localGroups, '未填写 API Key，已使用本地规则生成建议。');
      return;
    }

    const button = $('#suggestionSubmit');
    button.disabled = true;
    button.textContent = '生成中...';
    try {
      const data = await safeFetchJson(`${API_BASE_URL}/ai-suggest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: key,
          base_url: $('#modelBaseUrl').value.trim(),
          model: $('#modelName').value.trim(),
          messages: [
            { role: 'system', content: '你是专业穿搭顾问，只返回简洁中文建议。' },
            { role: 'user', content: `衣橱数据：${JSON.stringify(Storage.getAllClothing())}。偏好风格：${style}，偏好颜色：${color}。请给 3 条搭配建议。` },
          ],
        }),
      });
      renderSuggestions(localGroups, data.content || 'AI 已返回建议。下方同时保留本地规则方案，方便对照。');
    } catch {
      renderSuggestions(localGroups, 'AI 接口调用失败，已回退到本地建议。');
    } finally {
      button.disabled = false;
      button.textContent = '生成搭配建议';
    }
  });
  renderSuggestions(buildLocalSuggestions('all', 'all'), '这里会根据你的衣橱生成可落地的组合。填写 API Key 可以使用模型增强建议。');
}

const tryonState = {
  gender: 'male',
  worn: {},
};

function slotName(category) {
  return category === 'bottom' ? '下装' : Storage.getCategoryLabel(category);
}

function updateTryonStage() {
  $('.body-shape').className = `body-shape ${tryonState.gender === 'female' ? 'female' : ''}`;
  $$('.tryon-slot').forEach((slot) => {
    const item = tryonState.worn[slot.dataset.slot];
    slot.classList.toggle('filled', Boolean(item));
    slot.style.background = item ? getColorHex(item.color) : '';
    slot.textContent = item ? item.name : slotName(slot.dataset.slot);
  });

  const worn = Object.values(tryonState.worn);
  $('#wornSummary').innerHTML = worn.length
    ? worn.map((item) => `<span class="tag teal">${escapeHtml(item.name)}</span>`).join('')
    : '<span class="subtle">还没有试穿单品</span>';
}

function renderTryonList() {
  const list = $('#tryonList');
  const items = Storage.getAllClothing();
  if (!items.length) {
    list.innerHTML = '<div class="empty-state">衣橱为空，请先去衣橱管理添加单品。</div>';
    return;
  }
  list.innerHTML = items.map((item) => `
    <div class="tryon-row card">
      <img class="thumb" src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}">
      <div>
        <strong>${escapeHtml(item.name)}</strong>
        <p class="subtle" style="margin: 4px 0 0;">${Storage.getCategoryLabel(item.category)} · ${escapeHtml(item.color)}</p>
      </div>
      <button class="btn btn-small btn-secondary" data-wear="${escapeHtml(item.id)}">试穿</button>
    </div>
  `).join('');
}

function initTryonPage() {
  renderTryonList();
  updateTryonStage();

  $('#tryonList').addEventListener('click', (event) => {
    const button = event.target.closest('[data-wear]');
    if (!button) return;
    const item = Storage.getAllClothing().find((entry) => entry.id === button.dataset.wear);
    if (!item) return;
    const slot = item.category === 'dress' ? 'dress' : item.category;
    tryonState.worn[slot] = item;
    updateTryonStage();
  });

  $('#genderMale').addEventListener('click', () => {
    tryonState.gender = 'male';
    $('#genderMale').classList.add('btn-secondary');
    $('#genderFemale').classList.remove('btn-secondary');
    updateTryonStage();
  });
  $('#genderFemale').addEventListener('click', () => {
    tryonState.gender = 'female';
    $('#genderFemale').classList.add('btn-secondary');
    $('#genderMale').classList.remove('btn-secondary');
    updateTryonStage();
  });
  $('#clearTryon').addEventListener('click', () => {
    tryonState.worn = {};
    updateTryonStage();
  });
  $('#recordTryon').addEventListener('click', () => {
    Object.values(tryonState.worn).forEach((item) => Storage.updateWornCount(item.id));
    showNotification('已记录试穿单品', 'success');
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  const page = document.body.dataset.page;
  if (page === 'home') initIndexPage();
  if (page === 'wardrobe') initWardrobePage();
  if (page === 'outfit') initOutfitPage();
  if (page === 'suggestion') initSuggestionPage();
  if (page === 'tryon') initTryonPage();
});

window.showNotification = showNotification;
