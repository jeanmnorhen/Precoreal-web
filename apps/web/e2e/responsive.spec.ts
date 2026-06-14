import { test, expect } from '@playwright/test';

test.describe('Layout responsivo — Home', () => {
  test('hero títulos visíveis em todos os breakpoints', async ({ page }) => {
    await page.goto('/');
    const hero = page.locator('h1');
    await expect(hero).toBeVisible();
    await expect(hero).toContainText('preço justo');
  });

  test('botões CTA empilham verticalmente no mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');

    const ctaContainer = page.locator('.flex.flex-col.sm\\:flex-row').first();
    await expect(ctaContainer).toBeVisible();
    const flexDirection = await ctaContainer.evaluate((el) => getComputedStyle(el).flexDirection);
    expect(flexDirection).toBe('column');
  });

  test('header nav fica oculta no mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');

    const desktopNav = page.locator('nav.hidden.md\\:flex');
    await expect(desktopNav).toBeHidden();
  });

  test('grid de features adapta para 1 coluna no mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');

    const grid = page.locator('.grid.sm\\:grid-cols-3').first();
    await expect(grid).toBeVisible();
    const gridTemplateColumns = await grid.evaluate((el) => getComputedStyle(el).gridTemplateColumns);
    expect(gridTemplateColumns).not.toContain(' ');
  });
});

test.describe('Layout responsivo — Busca', () => {
  test('input de busca ocupa largura total no mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/busca');

    const input = page.locator('input[placeholder*="Nome"]');
    const box = await input.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThan(200);
  });
});

test.describe('Layout responsivo — Lojista (sem auth)', () => {
  test('acesso sem autenticação redireciona para login', async ({ page }) => {
    await page.goto('/lojista');
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });
});
