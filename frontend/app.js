// API 基础 URL - 从全局配置读取
const API_BASE_URL = (window.AppConfig && window.AppConfig.API_BASE_URL) || '/api';

// 衣橱管理相关函数
function displayWardrobe() {
    const wardrobe = Storage.getAllClothing();
    const filter = document.getElementById('category-filter').value;
    const grid = document.getElementById('wardrobe-grid');

    const filteredWardrobe = filter === 'all'
        ? wardrobe
        : wardrobe.filter(item => item.category === filter);

    if (filteredWardrobe.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: var(--spacing-xl);">
                <div style="width: 64px; height: 64px; background: var(--color-primary-light); border-radius: var(--radius-xl); display: flex; align-items: center; justify-content: center; margin: 0 auto var(--spacing-md);">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2">
                        <rect x="3" y="3" width="7" height="7"/>
                        <rect x="14" y="3" width="7" height="7"/>
                        <rect x="14" y="14" width="7" height="7"/>
                        <rect x="3" y="14" width="7" height="7"/>
                    </svg>
                </div>
                <h4 style="margin-bottom: var(--spacing-sm);">衣橱是空的</h4>
                <p class="text-muted">添加一些衣物来开始您的穿搭之旅吧！</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = filteredWardrobe.map(item => `
        <div class="card clothing-card">
            <div style="aspect-ratio: 3/4; overflow: hidden; border-radius: var(--radius-lg); margin-bottom: var(--spacing-md);">
                <img src="${item.image || 'placeholder.svg'}" alt="${item.name}" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            <h4 style="margin-bottom: var(--spacing-sm);">${item.name}</h4>
            <div style="display: flex; gap: var(--spacing-sm); margin-bottom: var(--spacing-sm);">
                <span class="tag tag-primary">${getCategoryName(item.category)}</span>
                <span class="tag tag-accent">${getSeasonName(item.season)}</span>
            </div>
            ${item.color ? `<span class="tag" style="background: rgba(0,0,0,0.04); border: 1px solid ${item.color === '白色' ? '#e0e0e0' : item.color === '黑色' ? '#333' : item.color}; color: ${item.color === '白色' ? '#666' : item.color === '黑色' ? '#fff' : item.color}; padding: var(--spacing-xs) var(--spacing-sm); border-radius: var(--radius-sm); font-size: 0.875rem;">${item.color}</span>` : ''}
        </div>
    `).join('');
}

function addClothing() {
    const name = prompt('衣物名称：');
    if (!name) return;

    const category = prompt('分类（top/bottom/dress/outerwear/shoes/accessory）：');
    const season = prompt('季节（spring/summer/autumn/winter）：');
    const color = prompt('颜色（可选）：');
    const image = prompt('图片URL（可选）：');

    const newItem = {
        id: Date.now(),
        name: name,
        category: category || 'top',
        season: season || 'all',
        color: color || '',
        image: image || ''
    };

    Storage.addClothing(newItem);
    displayWardrobe();
    showNotification('衣物添加成功！', 'success');
}

function getCategoryName(category) {
    const names = {
        top: '上衣',
        bottom: '裤子',
        dress: '连衣裙',
        outerwear: '外套',
        shoes: '鞋子',
        accessory: '配饰'
    };
    return names[category] || category;
}

function getSeasonName(season) {
    const names = {
        spring: '春季',
        summer: '夏季',
        autumn: '秋季',
        winter: '冬季',
        all: '全年'
    };
    return names[season] || season;
}

// 穿搭推荐相关函数
function generateOutfit() {
    const weather = document.getElementById('weather').value;
    const occasion = document.getElementById('occasion').value;
    const wardrobe = Storage.getAllClothing();

    if (wardrobe.length < 3) {
        showNotification('请先添加至少3件衣服再来获取推荐', 'error');
        return;
    }

    const resultDiv = document.getElementById('outfit-result');
    resultDiv.innerHTML = `
        <div style="text-align: center; padding: var(--spacing-xl);">
            <div class="loading" style="margin: 0 auto var(--spacing-md);"></div>
            <p class="text-muted">正在生成穿搭推荐...</p>
        </div>
    `;

    try {
        const response = await fetch(`${API_BASE_URL}/claude`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: [
                    {
                        role: 'user',
                        content: `作为一个智能穿搭顾问，请根据以下信息为我推荐一套穿搭：
                        天气：${getWeatherName(weather)}
                        场合：${getOccasionName(occasion)}
                        我的衣橱：${JSON.stringify(wardrobe)}

                        请按照以下格式返回：
                        1. 穿搭整体描述
                        2. 具体搭配细节（包括衣物名称、类型、颜色等）
                        3. 搭配理由

                        请使用中文回复，保持简洁专业。`
                    }
                ]
            })
        });

        const data = await response.json();
        resultDiv.innerHTML = `
            <div class="card" style="background: var(--color-primary-light); border: 1px solid var(--color-primary);">
                <h3 style="color: var(--color-primary); margin-bottom: var(--spacing-md);">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                    </svg>
                    穿搭推荐
                </h3>
                <div style="white-space: pre-line; color: var(--color-text-main); line-height: 1.6;">${data.content}</div>
            </div>
        `;

    } catch (error) {
        console.error('Error:', error);
        resultDiv.innerHTML = `
            <div class="card" style="background: rgba(231, 76, 60, 0.05); border: 1px solid #e74c3c;">
                <h3 style="color: #e74c3c; margin-bottom: var(--spacing-md);">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e74c3c" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12" y2="16"/>
                    </svg>
                    生成失败
                </h3>
                <p class="text-muted">生成推荐失败，请检查后端是否正在运行。</p>
            </div>
        `;
    }
}

function getWeatherName(weather) {
    const names = {
        sunny: '晴天',
        rainy: '雨天',
        cloudy: '阴天',
        snowy: '雪天'
    };
    return names[weather] || weather;
}

function getOccasionName(occasion) {
    const names = {
        casual: '休闲',
        work: '工作',
        formal: '正式',
        sport: '运动'
    };
    return names[occasion] || occasion;
}

// 搭配建议相关函数
async function generateSuggestion() {
    const styleType = document.getElementById('style-type').value;
    const colorPreference = document.getElementById('color-preference').value;
    const wardrobe = Storage.getAllClothing();

    if (wardrobe.length < 3) {
        showNotification('请先添加至少3件衣服再来获取推荐', 'error');
        return;
    }

    const resultDiv = document.getElementById('suggestion-result');
    resultDiv.innerHTML = `
        <div style="text-align: center; padding: var(--spacing-xl);">
            <div class="loading" style="margin: 0 auto var(--spacing-md);"></div>
            <p class="text-muted">正在生成搭配建议...</p>
        </div>
    `;

    try {
        const response = await fetch(`${API_BASE_URL}/claude`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: [
                    {
                        role: 'user',
                        content: `作为一个专业的搭配顾问，请根据以下信息为我提供搭配建议：
                        风格类型：${getStyleTypeName(styleType)}
                        颜色偏好：${getColorPreferenceName(colorPreference)}
                        我的衣橱：${JSON.stringify(wardrobe)}

                        请提供3-5种搭配建议，每种建议包括：
                        1. 搭配名称
                        2. 具体单品组合
                        3. 搭配技巧
                        4. 适合场合

                        请使用中文回复，保持简洁专业，格式清晰。`
                    }
                ]
            })
        });

        const data = await response.json();
        resultDiv.innerHTML = `
            <div class="card" style="background: var(--color-primary-light); border: 1px solid var(--color-primary);">
                <h3 style="color: var(--color-primary); margin-bottom: var(--spacing-md);">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2">
                        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
                        <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                        <line x1="12" y1="22.08" x2="12" y2="12"/>
                    </svg>
                    搭配建议
                </h3>
                <div style="white-space: pre-line; color: var(--color-text-main); line-height: 1.6;">${data.content}</div>
            </div>
        `;

    } catch (error) {
        console.error('Error:', error);
        resultDiv.innerHTML = `
            <div class="card" style="background: rgba(231, 76, 60, 0.05); border: 1px solid #e74c3c;">
                <h3 style="color: #e74c3c; margin-bottom: var(--spacing-md);">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e74c3c" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12" y2="16"/>
                    </svg>
                    生成失败
                </h3>
                <p class="text-muted">生成建议失败，请检查后端是否正在运行。</p>
            </div>
        `;
    }
}

function getStyleTypeName(styleType) {
    const names = {
        casual: '休闲风',
        professional: '职业风',
        elegant: '优雅风',
        sporty: '运动风',
        street: '街头风'
    };
    return names[styleType] || styleType;
}

function getColorPreferenceName(colorPreference) {
    const names = {
        all: '全部颜色',
        warm: '暖色调',
        cool: '冷色调',
        neutral: '中性色'
    };
    return names[colorPreference] || colorPreference;
}

// 通用工具函数
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: var(--spacing-sm);">
            ${type === 'error' ? `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12" y2="16"/>
                </svg>
            ` : type === 'success' ? `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
            ` : `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="16" x2="12" y2="12"/>
                    <line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
            `}
            <span style="font-weight: 500;">${message}</span>
        </div>
    `;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: var(--spacing-md);
        background: ${type === 'error' ? '#e74c3c' : type === 'success' ? '#2ecc71' : 'var(--color-primary)'};
        color: white;
        border-radius: var(--radius-lg);
        z-index: 1000;
        transform: translateX(400px);
        transition: transform var(--transition-base);
        box-shadow: var(--shadow-lg);
        min-width: 280px;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);

    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}