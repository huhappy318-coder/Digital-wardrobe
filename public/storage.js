// LocalStorage 数据管理 - ClosetAI

const STORAGE_KEY = 'closetai_wardrobe';

// 初始化存储
function initStorage() {
    if (!localStorage.getItem(STORAGE_KEY)) {
        const defaultClothing = [
            {
                id: Date.now().toString(),
                image: '',
                category: '上衣',
                color: '白色',
                style: '休闲',
                season: '春',
                name: '白色T恤',
                wornCount: 3,
                lastWorn: new Date(Date.now() - 86400000).toISOString(),
                addedAt: new Date().toISOString()
            },
            {
                id: (Date.now() + 1).toString(),
                image: '',
                category: '裤子',
                color: '蓝色',
                style: '休闲',
                season: '夏',
                name: '蓝色牛仔裤',
                wornCount: 5,
                lastWorn: new Date(Date.now() - 172800000).toISOString(),
                addedAt: new Date().toISOString()
            },
            {
                id: (Date.now() + 2).toString(),
                image: '',
                category: '外套',
                color: '黑色',
                style: '正式',
                season: '冬',
                name: '黑色西装',
                wornCount: 1,
                lastWorn: null,
                addedAt: new Date().toISOString()
            }
        ];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultClothing));
    }
}

// 添加一件衣服
function addClothing(item) {
    const wardrobe = getAllClothing();
    const newItem = {
        id: item.id || Date.now().toString(),
        image: item.image || '',
        category: item.category || '上衣',
        color: item.color || '',
        style: item.style || '休闲',
        season: item.season || '春',
        name: item.name || '',
        wornCount: item.wornCount || 0,
        lastWorn: item.lastWorn || null,
        addedAt: item.addedAt || new Date().toISOString()
    };
    wardrobe.push(newItem);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wardrobe));
    return newItem;
}

// 获取全部衣服
function getAllClothing() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

// 按分类获取
function getByCategory(category) {
    const wardrobe = getAllClothing();
    if (category === 'all') {
        return wardrobe;
    }
    return wardrobe.filter(item => item.category === category);
}

// 更新出镜次数
function updateWornCount(id) {
    const wardrobe = getAllClothing();
    const index = wardrobe.findIndex(item => item.id === id);
    if (index !== -1) {
        wardrobe[index].wornCount = (wardrobe[index].wornCount || 0) + 1;
        wardrobe[index].lastWorn = new Date().toISOString();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(wardrobe));
        return wardrobe[index];
    }
    return null;
}

// 删除一件衣服
function deleteClothing(id) {
    const wardrobe = getAllClothing().filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wardrobe));
}

// 获取统计数据
function getStats() {
    const wardrobe = getAllClothing();
    const categoryCount = {};
    const categories = ['上衣', '裤子', '裙子', '外套', '鞋子', '配件'];

    categories.forEach(category => {
        categoryCount[category] = 0;
    });

    wardrobe.forEach(item => {
        if (categoryCount[item.category] !== undefined) {
            categoryCount[item.category]++;
        } else {
            categoryCount[item.category] = 1;
        }
    });

    const neverWorn = wardrobe.filter(item => !item.lastWorn || item.wornCount === 0).length;

    const thisMonth = new Date();
    const monthStart = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1);
    const monthEnd = new Date(thisMonth.getFullYear(), thisMonth.getMonth() + 1, 0, 23, 59, 59);

    const thisMonthWornCount = wardrobe.reduce((sum, item) => {
        if (item.lastWorn) {
            const lastWornDate = new Date(item.lastWorn);
            if (lastWornDate >= monthStart && lastWornDate <= monthEnd) {
                sum += item.wornCount;
            }
        }
        return sum;
    }, 0);

    return {
        total: wardrobe.length,
        categories: categoryCount,
        neverWorn: neverWorn,
        thisMonthWornCount: thisMonthWornCount,
        avgWorn: wardrobe.length > 0 ? Math.round(thisMonthWornCount / wardrobe.length) : 0
    };
}

// 按条件搜索衣服
function searchClothing(query) {
    const wardrobe = getAllClothing();
    const lowerQuery = query.toLowerCase();

    return wardrobe.filter(item => {
        return item.name.toLowerCase().includes(lowerQuery) ||
               item.color.toLowerCase().includes(lowerQuery) ||
               item.category.toLowerCase().includes(lowerQuery) ||
               item.style.toLowerCase().includes(lowerQuery) ||
               item.season.toLowerCase().includes(lowerQuery);
    });
}

// 获取随机穿搭
function getRandomOutfit() {
    const wardrobe = getAllClothing();
    const tops = wardrobe.filter(item => ['上衣', '外套'].includes(item.category));
    const bottoms = wardrobe.filter(item => ['裤子', '裙子'].includes(item.category));
    const shoes = wardrobe.filter(item => item.category === '鞋子');
    const accessories = wardrobe.filter(item => item.category === '配件');

    const outfit = [];

    if (tops.length > 0) {
        outfit.push(tops[Math.floor(Math.random() * tops.length)]);
    }

    if (bottoms.length > 0) {
        outfit.push(bottoms[Math.floor(Math.random() * bottoms.length)]);
    }

    if (shoes.length > 0) {
        outfit.push(shoes[Math.floor(Math.random() * shoes.length)]);
    }

    if (accessories.length > 0) {
        outfit.push(accessories[Math.floor(Math.random() * accessories.length)]);
    }

    return outfit;
}

// 初始化存储
document.addEventListener('DOMContentLoaded', initStorage);

// 导出所有函数
window.Storage = {
    addClothing,
    getAllClothing,
    getByCategory,
    updateWornCount,
    deleteClothing,
    getStats,
    searchClothing,
    getRandomOutfit
};