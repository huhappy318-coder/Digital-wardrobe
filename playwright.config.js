const { defineConfig } = require('@playwright/test');

process.env.NO_PROXY = '127.0.0.1,localhost';
process.env.no_proxy = '127.0.0.1,localhost';
delete process.env.HTTP_PROXY;
delete process.env.HTTPS_PROXY;
delete process.env.http_proxy;
delete process.env.https_proxy;

module.exports = defineConfig({
  testDir: '.',
  testMatch: ['test_frontend.spec.js', 'test_responsive.spec.js'],
  use: {
    baseURL: 'http://127.0.0.1:8000',
    proxy: undefined,
  },
  webServer: {
    command: 'cmd /c python -m http.server 8000 -d public',
    url: 'http://127.0.0.1:8000',
    reuseExistingServer: true,
    timeout: 120000,
    env: {
      NO_PROXY: '127.0.0.1,localhost',
      no_proxy: '127.0.0.1,localhost',
      HTTP_PROXY: '',
      HTTPS_PROXY: '',
      http_proxy: '',
      https_proxy: '',
    },
  },
});
