# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: responsive.spec.ts >> Layout responsivo — Home >> grid de features adapta para 1 coluna no mobile
- Location: e2e\responsive.spec.ts:29:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('.grid.sm\\:grid-cols-2').first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('.grid.sm\\:grid-cols-2').first()

```

```yaml
- main:
  - link "R$ PreçoReal":
    - /url: /
  - link "Entrar":
    - /url: /login
  - link "Cadastrar":
    - /url: /register
  - text: Grátis para consumidores
  - heading "O preço justo ao seu lado" [level=1]
  - paragraph: Compare preços em lojas perto de você. Escaneie, encontre a melhor oferta e economize.
  - link "📷 Escanear":
    - /url: /scanner
  - link "🔍 Buscar":
    - /url: /busca
  - text: Geolocalização
  - heading "Ofertas perto de você" [level=2]
  - paragraph: Veja anúncios de lojas na sua região. Compare preços e encontre a melhor oferta perto de casa.
  - button "📍 Mostrar ofertas da minha região"
  - text: 🔍 Compare preços 📍 Lojas próximas 💰 Economize 📍
  - heading "Ofertas geolocalizadas" [level=3]
  - paragraph: Anúncios de lojas próximas, ordenados por distância.
  - text: 📷
  - heading "Scanner de código de barras" [level=3]
  - paragraph: Capture qualquer EAN-13 e veja preços na região.
  - text: 🏪
  - heading "Portal do lojista" [level=3]
  - paragraph: Anuncie ofertas e atraia clientes locais.
  - heading "Economize hoje" [level=2]
  - paragraph: Grátis, sem cadastro. Escaneie um produto e veja onde está mais barato.
  - link "📷 Escanear agora":
    - /url: /scanner
  - paragraph: © 2026 Preço Real · Comparador de preços inteligente
- alert
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Layout responsivo — Home', () => {
  4  |   test('hero títulos visíveis em todos os breakpoints', async ({ page }) => {
  5  |     await page.goto('/');
  6  |     const hero = page.locator('h1');
  7  |     await expect(hero).toBeVisible();
  8  |     await expect(hero).toContainText('preço justo');
  9  |   });
  10 | 
  11 |   test('botões CTA empilham verticalmente no mobile', async ({ page }) => {
  12 |     await page.setViewportSize({ width: 375, height: 812 });
  13 |     await page.goto('/');
  14 | 
  15 |     const ctaContainer = page.locator('.flex.flex-col.sm\\:flex-row').first();
  16 |     await expect(ctaContainer).toBeVisible();
  17 |     const flexDirection = await ctaContainer.evaluate((el) => getComputedStyle(el).flexDirection);
  18 |     expect(flexDirection).toBe('column');
  19 |   });
  20 | 
  21 |   test('header nav fica oculta no mobile', async ({ page }) => {
  22 |     await page.setViewportSize({ width: 375, height: 812 });
  23 |     await page.goto('/');
  24 | 
  25 |     const desktopNav = page.locator('nav.hidden.md\\:flex');
  26 |     await expect(desktopNav).toBeHidden();
  27 |   });
  28 | 
  29 |   test('grid de features adapta para 1 coluna no mobile', async ({ page }) => {
  30 |     await page.setViewportSize({ width: 375, height: 812 });
  31 |     await page.goto('/');
  32 | 
  33 |     const grid = page.locator('.grid.sm\\:grid-cols-2').first();
> 34 |     await expect(grid).toBeVisible();
     |                        ^ Error: expect(locator).toBeVisible() failed
  35 |   });
  36 | });
  37 | 
  38 | test.describe('Layout responsivo — Busca', () => {
  39 |   test('input de busca ocupa largura total no mobile', async ({ page }) => {
  40 |     await page.setViewportSize({ width: 375, height: 812 });
  41 |     await page.goto('/busca');
  42 | 
  43 |     const input = page.locator('input[placeholder*="Nome"]');
  44 |     const box = await input.boundingBox();
  45 |     expect(box).not.toBeNull();
  46 |     expect(box!.width).toBeGreaterThan(200);
  47 |   });
  48 | });
  49 | 
  50 | test.describe('Layout responsivo — Lojista (sem auth)', () => {
  51 |   test('acesso sem autenticação redireciona para login', async ({ page }) => {
  52 |     await page.goto('/lojista');
  53 |     await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  54 |   });
  55 | });
  56 | 
```