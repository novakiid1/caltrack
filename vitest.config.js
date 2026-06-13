import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'node',
        globals: true,
        testTimeout: 30000,
        fileParallelism: false,
        include: ['tests/backend/**/*.test.js'],
        browser: {
            enabled: true,
            name: 'chromium',      // Can be 'chromium', 'firefox', or 'webkit'
            provider: 'playwright', // Uses Playwright under the hood
            headless: false
        }
    }
});
