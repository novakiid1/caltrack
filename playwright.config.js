import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './tests/ui',
    use: {
        baseURL: 'http://localhost:8081',
    },
    webServer: {
        command: 'node tests/ui/start-server.js',
        port: 8081,
        reuseExistingServer: false,
        timeout: 120000,
    },
});
