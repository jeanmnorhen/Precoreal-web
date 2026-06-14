"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
exports.default = (0, test_1.defineConfig)({
    testDir: './e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: 'html',
    use: {
        baseURL: process.env.BASE_URL || 'https://precoreal-web.vercel.app',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
    },
    projects: [
        {
            name: 'Desktop',
            use: { ...test_1.devices['Desktop Chrome'] },
        },
        {
            name: 'Tablet',
            use: { ...test_1.devices['iPad Pro 11'], viewport: { width: 834, height: 1194 } },
        },
        {
            name: 'Mobile',
            use: { ...test_1.devices['Pixel 5'] },
        },
    ],
});
