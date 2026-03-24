// 简单的 storage.js 测试脚本
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// 创建临时HTML文件来测试storage.js
const testHtml = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>Storage.js 测试</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .test-section {
            background: white;
            padding: 20px;
            margin: 10px 0;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .success { color: green; }
        .error { color: red; }
        button {
            background: #4A6FA5;
            color: white;
            padding: 10px 15px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            margin-right: 10px;
        }
        button:hover { background: #3A5F90; }
        .log {
            background: #f0f0f0;
            padding: 10px;
            margin: 10px 0;
            border-radius: 5px;
            font-family: monospace;
        }
    </style>
</head>
<body>
    <h1>ClosetAI Storage.js 测试</h1>

    <div class="test-section">
        <h2>1. Storage.js 加载测试</h2>
        <div id="loadResult"></div>
    </div>

    <div class="test-section">
        <h2>2. 初始衣橱内容</h2>
        <button onclick="testGetAllClothing()">获取所有衣物</button>
        <div id="getAllResult"></div>
    </div>

    <div class="test-section">
        <h2>3. 添加衣物测试</h2>
        <button onclick="testAddClothing()">添加一件衣物</button>
        <div id="addResult"></div>
    </div>

    <div class="test-section">
        <h2>4. 统计信息测试</h2>
        <button onclick="testGetStats()">获取统计信息</button>
        <div id="statsResult"></div>
    </div>

    <div class="test-section">
        <h2>5. 分类筛选测试</h2>
        <button onclick="testGetByCategory()">按分类筛选</button>
        <div id="categoryResult"></div>
    </div>

    <div class="test-section">
        <h2>控制台日志</h2>
        <div id="consoleLog" class="log"></div>
    </div>

    <script src="${path.resolve(__dirname, 'frontend', 'storage.js')}"></script>
    <script>
        // 简单的日志函数
        function log(msg) {
            const logDiv = document.getElementById('consoleLog');
            logDiv.innerHTML += new Date().toLocaleTimeString() + ' - ' + msg + '<br>';
            logDiv.scrollTop = logDiv.scrollHeight;
        }

        // 1. 测试加载
        document.addEventListener('DOMContentLoaded', function() {
            try {
                log('Storage.js 已成功加载');
                log('initStorage 已执行');

                document.getElementById('loadResult').innerHTML =
                    '<span class="success">✅ Storage.js 加载成功</span>';
            } catch (e) {
                document.getElementById('loadResult').innerHTML =
                    '<span class="error">❌ Storage.js 加载失败: ' + e + '</span>';
            }
        });

        // 2. 获取所有衣物
        function testGetAllClothing() {
            try {
                const wardrobe = getAllClothing();
                log('getAllClothing() 返回 ' + wardrobe.length + ' 件衣物');
                document.getElementById('getAllResult').innerHTML =
                    '<span class="success">✅ 成功获取 ' + wardrobe.length + ' 件衣物</span><br>' +
                    '<pre style="font-size: 12px; margin-top: 10px;">' +
                    JSON.stringify(wardrobe, null, 2) + '</pre>';
            } catch (e) {
                document.getElementById('getAllResult').innerHTML =
                    '<span class="error">❌ 失败: ' + e + '</span>';
            }
        }

        // 3. 添加衣物
        function testAddClothing() {
            try {
                const newItem = {
                    id: Date.now().toString(),
                    image: '',
                    category: '上衣',
                    color: '蓝色',
                    style: '休闲',
                    season: '夏',
                    name: '蓝色T恤',
                    wornCount: 0,
                    lastWorn: null,
                    addedAt: new Date().toISOString()
                };
                addClothing(newItem);
                log('addClothing() 成功添加 ' + newItem.name);
                document.getElementById('addResult').innerHTML =
                    '<span class="success">✅ 成功添加 ' + newItem.name + '</span>';
            } catch (e) {
                document.getElementById('addResult').innerHTML =
                    '<span class="error">❌ 失败: ' + e + '</span>';
            }
        }

        // 4. 统计信息
        function testGetStats() {
            try {
                const stats = getStats();
                log('getStats() 统计结果: ' + JSON.stringify(stats));
                document.getElementById('statsResult').innerHTML =
                    '<span class="success">✅ 统计信息获取成功</span><br>' +
                    '<pre style="font-size: 12px; margin-top: 10px;">' +
                    JSON.stringify(stats, null, 2) + '</pre>';
            } catch (e) {
                document.getElementById('statsResult').innerHTML =
                    '<span class="error">❌ 失败: ' + e + '</span>';
            }
        }

        // 5. 分类筛选
        function testGetByCategory() {
            try {
                const tops = getByCategory('上衣');
                log('getByCategory("上衣") 找到 ' + tops.length + ' 件');
                document.getElementById('categoryResult').innerHTML =
                    '<span class="success">✅ 上衣类别找到 ' + tops.length + ' 件</span><br>' +
                    '<pre style="font-size: 12px; margin-top: 10px;">' +
                    JSON.stringify(tops, null, 2) + '</pre>';
            } catch (e) {
                document.getElementById('categoryResult').innerHTML =
                    '<span class="error">❌ 失败: ' + e + '</span>';
            }
        }
    </script>
</body>
</html>
`;

const testFile = path.resolve(__dirname, 'test_storage.html');
fs.writeFileSync(testFile, testHtml, 'utf8');
console.log('✅ 创建了测试文件:', testFile);

// 使用简单的HTTP服务器来测试页面
const http = require('http');
const PORT = 8080;

const server = http.createServer((req, res) => {
    let filePath = '.' + req.url;
    if (filePath === './') {
        filePath = testFile;
    } else if (req.url.startsWith('/frontend/')) {
        filePath = path.resolve(__dirname, req.url.slice(1));
    }

    console.log('📄 访问:', req.url, '->', filePath);

    fs.readFile(filePath, 'utf8', (err, content) => {
        if (err) {
            res.writeHead(404);
            res.end('File not found');
        } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(content);
        }
    });
});

server.listen(PORT, () => {
    console.log('🚀 测试服务器已启动: http://localhost:' + PORT);
    console.log('💡 请打开浏览器访问 http://localhost:' + PORT + ' 来测试 storage.js');
    console.log('📦 存储路径: localStorage - key = "closetai_wardrobe"');
    console.log('');
    console.log('📖 测试说明:');
    console.log('1. 点击按钮逐个测试 storage.js 的功能');
    console.log('2. 查看控制台日志输出');
    console.log('3. 使用浏览器开发者工具检查 Local Storage');
    console.log('4. 刷新页面测试数据的持久化');
    console.log('');
    console.log('🛑 按 Ctrl+C 停止服务器');
});