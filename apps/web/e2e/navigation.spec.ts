import { test, expect } from '@playwright/test';

test.describe('Navegação — Header', () => {
  test.use({ viewport: { width: 1280, height: 800 } });
  test('links do header navegam para páginas corretas', async ({ page }) => {
    await page.goto('/');

    const buscarLink = page.locator('header a[href="/busca"]');
    await buscarLink.click();
    await expect(page).toHaveURL(/\/busca/);

    await page.goto('/');
    const scannerLink = page.locator('header a[href="/scanner"]');
    await scannerLink.click();
    await expect(page).toHaveURL(/\/scanner/);

    await page.goto('/');
    const lojistaLink = page.locator('header a[href="/lojista"]');
    await lojistaLink.click();
    await expect(page).toHaveURL(/\/lojista|\/login/);
  });

  test('header contém logo com link para home', async ({ page }) => {
    await page.goto('/');
    const logoLink = page.locator('a[href="/"]').first();
    await expect(logoLink).toBeVisible();
    await expect(logoLink).toContainText('Real');
  });
});

test.describe('Autenticação — Fluxo Login/Register', () => {
  test('página de login renderiza formulário', async ({ page }) => {
    await page.goto('/login');

    await expect(page.locator('h1')).toContainText('Entrar');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('página de register renderiza alternador de tipo', async ({ page }) => {
    await page.goto('/register');

    await expect(page.locator('h1')).toContainText('Criar conta');
    const tipoBtns = page.locator('button[type="button"]');
    await expect(tipoBtns).toHaveCount(2);
    await expect(tipoBtns.nth(0)).toContainText('Consumidor');
    await expect(tipoBtns.nth(1)).toContainText('Lojista');
  });

  test('link de cadastro leva para /register', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('link', { name: 'Cadastre-se' }).click();
    await expect(page).toHaveURL(/\/register/);
  });

  test('link de login leva para /login', async ({ page }) => {
    await page.goto('/register');
    await page.getByRole('link', { name: 'Entrar' }).click();
    await expect(page).toHaveURL(/\/login/);
  });

  test('login submete formulário mesmo sem backend', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[type="email"]', 'teste@teste.com');
    await page.fill('input[type="password"]', '123456');

    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);

    const erroVisivel = await page.locator('text=Email ou senha inválidos').isVisible().catch(() => false);
    const aindaNoLogin = page.url().includes('/login');
    expect(erroVisivel || aindaNoLogin).toBe(true);
  });

  test('register submete formulário', async ({ page }) => {
    await page.goto('/register');

    await page.fill('input[placeholder="Seu nome"]', 'Teste User');
    await page.fill('input[type="email"]', 'novo@teste.com');
    await page.fill('input[placeholder*="Mínimo"]', '123456');
    await page.locator('button[type="button"]').first().click();

    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);

    const erroVisivel = await page.locator('text=Email já cadastrado').isVisible().catch(() => false);
    const aindaNoRegister = page.url().includes('/register');
    expect(erroVisivel || aindaNoRegister).toBe(true);
  });
});

test.describe('Busca — Interação', () => {
  test('input de busca renderiza e submete', async ({ page }) => {
    await page.goto('/busca');

    const input = page.locator('input[placeholder*="Nome"]');
    await expect(input).toBeVisible();

    await input.fill('arroz');
    await page.getByRole('button', { name: 'Buscar' }).click();

    await expect(page).toHaveURL(/busca=arroz/);
  });

  test('exibe estado vazio quando busca sem termo', async ({ page }) => {
    await page.goto('/busca');

    await expect(page.locator('text=Digite um termo')).toBeVisible();
  });
});

test.describe('Scanner — Página', () => {
  test('página do scanner renderiza', async ({ page }) => {
    await page.goto('/scanner');

    await expect(page.locator('h1')).toContainText('Escanear produto');
    await expect(page.locator('text=Compatível com EAN-13')).toBeVisible();
  });
});

test.describe('Navegação — Breadcrumbs e Voltar', () => {
  test('botão voltar na busca leva para home', async ({ page }) => {
    await page.goto('/busca');
    await page.locator('a', { hasText: '←' }).first().click();
    await expect(page).toHaveURL('/');
  });

  test('botão voltar no scanner leva para home', async ({ page }) => {
    await page.goto('/scanner');
    await page.locator('a', { hasText: '←' }).first().click();
    await expect(page).toHaveURL('/');
  });
});
