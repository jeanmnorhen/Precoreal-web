"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
test_1.test.describe('Navegação — Header', () => {
    test_1.test.use({ viewport: { width: 1280, height: 800 } });
    (0, test_1.test)('links do header navegam para páginas corretas', async ({ page }) => {
        await page.goto('/');
        const buscarLink = page.locator('header a[href="/busca"]');
        await buscarLink.click();
        await (0, test_1.expect)(page).toHaveURL(/\/busca/);
        await page.goto('/');
        const scannerLink = page.locator('header a[href="/scanner"]');
        await scannerLink.click();
        await (0, test_1.expect)(page).toHaveURL(/\/scanner/);
        await page.goto('/');
        const lojistaLink = page.locator('header a[href="/lojista"]');
        await lojistaLink.click();
        await (0, test_1.expect)(page).toHaveURL(/\/lojista|\/login/);
    });
    (0, test_1.test)('header contém logo com link para home', async ({ page }) => {
        await page.goto('/');
        const logoLink = page.locator('a[href="/"]').first();
        await (0, test_1.expect)(logoLink).toBeVisible();
        await (0, test_1.expect)(logoLink).toContainText('Real');
    });
});
test_1.test.describe('Autenticação — Fluxo Login/Register', () => {
    (0, test_1.test)('página de login renderiza formulário', async ({ page }) => {
        await page.goto('/login');
        await (0, test_1.expect)(page.locator('h1')).toContainText('Entrar');
        await (0, test_1.expect)(page.locator('input[type="email"]')).toBeVisible();
        await (0, test_1.expect)(page.locator('input[type="password"]')).toBeVisible();
        await (0, test_1.expect)(page.locator('button[type="submit"]')).toBeVisible();
    });
    (0, test_1.test)('página de register renderiza alternador de tipo', async ({ page }) => {
        await page.goto('/register');
        await (0, test_1.expect)(page.locator('h1')).toContainText('Criar conta');
        const tipoBtns = page.locator('button[type="button"]');
        await (0, test_1.expect)(tipoBtns).toHaveCount(2);
        await (0, test_1.expect)(tipoBtns.nth(0)).toContainText('Consumidor');
        await (0, test_1.expect)(tipoBtns.nth(1)).toContainText('Lojista');
    });
    (0, test_1.test)('link de cadastro leva para /register', async ({ page }) => {
        await page.goto('/login');
        await page.getByRole('link', { name: 'Cadastre-se' }).click();
        await (0, test_1.expect)(page).toHaveURL(/\/register/);
    });
    (0, test_1.test)('link de login leva para /login', async ({ page }) => {
        await page.goto('/register');
        await page.getByRole('link', { name: 'Entrar' }).click();
        await (0, test_1.expect)(page).toHaveURL(/\/login/);
    });
    (0, test_1.test)('login submete formulário mesmo sem backend', async ({ page }) => {
        await page.goto('/login');
        await page.fill('input[type="email"]', 'teste@teste.com');
        await page.fill('input[type="password"]', '123456');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000);
        const erroVisivel = await page.locator('text=Email ou senha inválidos').isVisible().catch(() => false);
        const aindaNoLogin = page.url().includes('/login');
        (0, test_1.expect)(erroVisivel || aindaNoLogin).toBe(true);
    });
    (0, test_1.test)('register submete formulário', async ({ page }) => {
        await page.goto('/register');
        await page.fill('input[placeholder="Seu nome"]', 'Teste User');
        await page.fill('input[type="email"]', 'novo@teste.com');
        await page.fill('input[placeholder*="Mínimo"]', '123456');
        await page.locator('button[type="button"]').first().click();
        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000);
        const erroVisivel = await page.locator('text=Email já cadastrado').isVisible().catch(() => false);
        const aindaNoRegister = page.url().includes('/register');
        (0, test_1.expect)(erroVisivel || aindaNoRegister).toBe(true);
    });
});
test_1.test.describe('Busca — Interação', () => {
    (0, test_1.test)('input de busca renderiza e submete', async ({ page }) => {
        await page.goto('/busca');
        const input = page.locator('input[placeholder*="Nome"]');
        await (0, test_1.expect)(input).toBeVisible();
        await input.fill('arroz');
        await page.getByRole('button', { name: 'Buscar' }).click();
        await (0, test_1.expect)(page).toHaveURL(/busca=arroz/);
    });
    (0, test_1.test)('exibe estado vazio quando busca sem termo', async ({ page }) => {
        await page.goto('/busca');
        await (0, test_1.expect)(page.locator('text=Digite um termo')).toBeVisible();
    });
});
test_1.test.describe('Scanner — Página', () => {
    (0, test_1.test)('página do scanner renderiza', async ({ page }) => {
        await page.goto('/scanner');
        await (0, test_1.expect)(page.locator('h1')).toContainText('Escanear produto');
        await (0, test_1.expect)(page.locator('text=Compatível com EAN-13')).toBeVisible();
    });
});
test_1.test.describe('Navegação — Breadcrumbs e Voltar', () => {
    (0, test_1.test)('botão voltar na busca leva para home', async ({ page }) => {
        await page.goto('/busca');
        await page.locator('a', { hasText: '←' }).first().click();
        await (0, test_1.expect)(page).toHaveURL('/');
    });
    (0, test_1.test)('botão voltar no scanner leva para home', async ({ page }) => {
        await page.goto('/scanner');
        await page.locator('a', { hasText: '←' }).first().click();
        await (0, test_1.expect)(page).toHaveURL('/');
    });
});
