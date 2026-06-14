"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
test_1.test.describe('Layout responsivo — Home', () => {
    (0, test_1.test)('hero títulos visíveis em todos os breakpoints', async ({ page }) => {
        await page.goto('/');
        const hero = page.locator('h1');
        await (0, test_1.expect)(hero).toBeVisible();
        await (0, test_1.expect)(hero).toContainText('preço justo');
    });
    (0, test_1.test)('botões CTA empilham verticalmente no mobile', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 812 });
        await page.goto('/');
        const ctaContainer = page.locator('.flex.flex-col.sm\\:flex-row').first();
        await (0, test_1.expect)(ctaContainer).toBeVisible();
        const flexDirection = await ctaContainer.evaluate((el) => getComputedStyle(el).flexDirection);
        (0, test_1.expect)(flexDirection).toBe('column');
    });
    (0, test_1.test)('header nav fica oculta no mobile', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 812 });
        await page.goto('/');
        const desktopNav = page.locator('nav.hidden.md\\:flex');
        await (0, test_1.expect)(desktopNav).toBeHidden();
    });
    (0, test_1.test)('grid de features adapta para 1 coluna no mobile', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 812 });
        await page.goto('/');
        const grid = page.locator('.grid.sm\\:grid-cols-3').first();
        await (0, test_1.expect)(grid).toBeVisible();
        const gridTemplateColumns = await grid.evaluate((el) => getComputedStyle(el).gridTemplateColumns);
        (0, test_1.expect)(gridTemplateColumns).not.toContain(' ');
    });
});
test_1.test.describe('Layout responsivo — Busca', () => {
    (0, test_1.test)('input de busca ocupa largura total no mobile', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 812 });
        await page.goto('/busca');
        const input = page.locator('input[placeholder*="Nome"]');
        const box = await input.boundingBox();
        (0, test_1.expect)(box).not.toBeNull();
        (0, test_1.expect)(box.width).toBeGreaterThan(200);
    });
});
test_1.test.describe('Layout responsivo — Lojista (sem auth)', () => {
    (0, test_1.test)('acesso sem autenticação redireciona para login', async ({ page }) => {
        await page.goto('/lojista');
        await (0, test_1.expect)(page).toHaveURL(/\/login/, { timeout: 10000 });
    });
});
