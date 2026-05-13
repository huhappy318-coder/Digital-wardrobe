(function () {
  const config = {
    API_BASE_URL: document.querySelector('meta[name="api-base-url"]')?.content || '/api',
    AI_MODEL_BASE_URL: document.querySelector('meta[name="ai-base-url"]')?.content || 'https://api.deepseek.com/v1',
    AI_MODEL_NAME: document.querySelector('meta[name="ai-model"]')?.content || 'deepseek-chat',
  };

  window.AppConfig = {
    ...(window.AppConfig || {}),
    ...config,
  };

  window.modelConfig = {
    deepseek: { base_url: 'https://api.deepseek.com/v1', model: 'deepseek-chat' },
    qwen: { base_url: 'https://dashscope.aliyuncs.com/compatible-mode/v1', model: 'qwen-plus' },
    doubao: { base_url: 'https://ark.cn-beijing.volces.com/api/v3', model: 'doubao-pro-4k' },
    kimi: { base_url: 'https://api.moonshot.cn/v1', model: 'moonshot-v1-8k' },
  };
})();
