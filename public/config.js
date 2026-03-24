// 应用配置
(function() {
  // 默认配置
  const defaultConfig = {
    // API 基础路径
    API_BASE_URL: '/api',

    // AI 模型配置
    DEEPSEEK_API_URL: 'https://api.deepseek.com/v1',
    QWEN_API_URL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    DOUBAO_API_URL: 'https://ark.cn-beijing.volces.com/api/v3',
    KIMI_API_URL: 'https://api.moonshot.cn/v1',

    // AI 模型名称
    DEEPSEEK_MODEL: 'deepseek-chat',
    QWEN_MODEL: 'qwen-plus',
    DOUBAO_MODEL: 'doubao-pro-4k',
    KIMI_MODEL: 'moonshot-v1-8k'
  };

  // 尝试从 process.env 读取环境变量（Next.js风格）
  function getEnvFromProcess() {
    const env = {};
    const envKeys = [
      'NEXT_PUBLIC_API_URL',
      'NEXT_PUBLIC_DEEPSEEK_API_URL',
      'NEXT_PUBLIC_QWEN_API_URL',
      'NEXT_PUBLIC_DOUBAO_API_URL',
      'NEXT_PUBLIC_KIMI_API_URL',
      'NEXT_PUBLIC_DEEPSEEK_MODEL',
      'NEXT_PUBLIC_QWEN_MODEL',
      'NEXT_PUBLIC_DOUBAO_MODEL',
      'NEXT_PUBLIC_KIMI_MODEL'
    ];

    envKeys.forEach(key => {
      // 检查全局变量（Vercel构建时注入）
      if (typeof window !== 'undefined' && window[key]) {
        env[key] = window[key];
      }
      // 检查meta标签中的环境变量
      const metaValue = document.querySelector(`meta[name="${key}"]`)?.content;
      if (metaValue) {
        env[key] = metaValue;
      }
    });

    return env;
  }

  // 从 meta 标签获取环境变量
  function getEnvFromMeta() {
    const env = {};
    const metaTags = document.querySelectorAll('meta[name^="env-"]');
    metaTags.forEach(meta => {
      const key = meta.name.replace('env-', '');
      env[key] = meta.content;
    });
    return env;
  }

  // 合并配置
  const processEnv = getEnvFromProcess();
  const metaEnv = getEnvFromMeta();
  const config = { ...defaultConfig, ...metaEnv, ...processEnv };

  // 映射Next.js环境变量到配置键
  if (processEnv.NEXT_PUBLIC_API_URL) {
    config.API_BASE_URL = processEnv.NEXT_PUBLIC_API_URL;
  }
  if (processEnv.NEXT_PUBLIC_DEEPSEEK_API_URL) {
    config.DEEPSEEK_API_URL = processEnv.NEXT_PUBLIC_DEEPSEEK_API_URL;
  }
  if (processEnv.NEXT_PUBLIC_QWEN_API_URL) {
    config.QWEN_API_URL = processEnv.NEXT_PUBLIC_QWEN_API_URL;
  }
  if (processEnv.NEXT_PUBLIC_DOUBAO_API_URL) {
    config.DOUBAO_API_URL = processEnv.NEXT_PUBLIC_DOUBAO_API_URL;
  }
  if (processEnv.NEXT_PUBLIC_KIMI_API_URL) {
    config.KIMI_API_URL = processEnv.NEXT_PUBLIC_KIMI_API_URL;
  }
  if (processEnv.NEXT_PUBLIC_DEEPSEEK_MODEL) {
    config.DEEPSEEK_MODEL = processEnv.NEXT_PUBLIC_DEEPSEEK_MODEL;
  }
  if (processEnv.NEXT_PUBLIC_QWEN_MODEL) {
    config.QWEN_MODEL = processEnv.NEXT_PUBLIC_QWEN_MODEL;
  }
  if (processEnv.NEXT_PUBLIC_DOUBAO_MODEL) {
    config.DOUBAO_MODEL = processEnv.NEXT_PUBLIC_DOUBAO_MODEL;
  }
  if (processEnv.NEXT_PUBLIC_KIMI_MODEL) {
    config.KIMI_MODEL = processEnv.NEXT_PUBLIC_KIMI_MODEL;
  }

  // 全局配置对象
  window.AppConfig = config;

  // 模型配置对象（供 suggestion.html 使用）
  window.modelConfig = {
    deepseek: {
      base_url: config.DEEPSEEK_API_URL,
      model: config.DEEPSEEK_MODEL
    },
    qwen: {
      base_url: config.QWEN_API_URL,
      model: config.QWEN_MODEL
    },
    doubao: {
      base_url: config.DOUBAO_API_URL,
      model: config.DOUBAO_MODEL
    },
    kimi: {
      base_url: config.KIMI_API_URL,
      model: config.KIMI_MODEL
    }
  };
})();