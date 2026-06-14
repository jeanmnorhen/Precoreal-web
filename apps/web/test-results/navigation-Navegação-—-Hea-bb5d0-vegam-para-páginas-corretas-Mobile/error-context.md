# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: navigation.spec.ts >> Navegação — Header >> links do header navegam para páginas corretas
- Location: e2e\navigation.spec.ts:4:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('header a[href="/busca"]')
    - locator resolved to <a href="/busca" class="hover:text-foreground transition-colors">Buscar</a>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is not visible
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is not visible
    - retrying click action
      - waiting 100ms
    56 × waiting for element to be visible, enabled and stable
       - element is not visible
     - retrying click action
       - waiting 500ms
    - waiting for element to be visible, enabled and stable

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - main [ref=e2]:
    - generic [ref=e4]:
      - link "R$ PreçoReal" [ref=e5] [cursor=pointer]:
        - /url: /
        - generic [ref=e6]: R$
        - generic [ref=e7]: PreçoReal
      - generic [ref=e8]:
        - link "Entrar" [ref=e9] [cursor=pointer]:
          - /url: /login
        - link "Cadastrar" [ref=e10] [cursor=pointer]:
          - /url: /register
    - generic [ref=e15]:
      - generic [ref=e16]: Grátis para consumidores
      - heading "O preço justo ao seu lado" [level=1] [ref=e18]:
        - text: O preço justo
        - generic [ref=e19]: ao seu lado
      - paragraph [ref=e21]: Compare preços de produtos em lojas perto de você. Escaneie, encontre a melhor oferta e economize toda semana.
      - generic [ref=e22]:
        - link "📷 Escanear produto" [ref=e23] [cursor=pointer]:
          - /url: /scanner
          - generic [ref=e24]: 📷
          - text: Escanear produto
        - link "🔍 Buscar ofertas" [ref=e25] [cursor=pointer]:
          - /url: /busca
    - generic [ref=e27]:
      - generic [ref=e28]:
        - heading "Como funciona" [level=2] [ref=e29]
        - paragraph [ref=e30]: Três passos simples para nunca mais pagar caro
      - generic [ref=e31]:
        - generic [ref=e32]:
          - generic [ref=e33]: "01"
          - heading "Escaneie" [level=3] [ref=e34]
          - paragraph [ref=e35]: Capture o código de barras com a câmera do celular.
        - generic [ref=e36]:
          - generic [ref=e37]: "02"
          - heading "Compare" [level=3] [ref=e38]
          - paragraph [ref=e39]: Veja todas as ofertas disponíveis perto de você.
        - generic [ref=e40]:
          - generic [ref=e41]: "03"
          - heading "Economize" [level=3] [ref=e42]
          - paragraph [ref=e43]: Escolha o melhor preço e vá direto à loja.
    - generic [ref=e45]:
      - generic [ref=e46]:
        - heading "Recursos" [level=2] [ref=e47]
        - paragraph [ref=e48]: Tudo que você precisa para economizar
      - generic [ref=e49]:
        - generic [ref=e50]:
          - generic [ref=e51]: 📍
          - generic [ref=e52]:
            - heading "Ofertas perto de você" [level=3] [ref=e53]
            - paragraph [ref=e54]: Anúncios geolocalizados de lojas no seu bairro. Compare preços sem sair de casa.
        - generic [ref=e55]:
          - generic [ref=e56]: 📷
          - generic [ref=e57]:
            - heading "Scanner inteligente" [level=3] [ref=e58]
            - paragraph [ref=e59]: Aponte a câmera para qualquer código de barras e veja o preço em todas as lojas próximas.
        - generic [ref=e60]:
          - generic [ref=e61]: 📊
          - generic [ref=e62]:
            - heading "Histórico de preços" [level=3] [ref=e63]
            - paragraph [ref=e64]: Acompanhe a variação de preços ao longo do tempo e compre no momento certo.
        - generic [ref=e65]:
          - generic [ref=e66]: 🏪
          - generic [ref=e67]:
            - heading "Portal do lojista" [level=3] [ref=e68]
            - paragraph [ref=e69]: Anuncie suas ofertas, gerencie créditos e atraia clientes da sua região.
    - generic [ref=e71]:
      - heading "Ofertas perto de você" [level=2] [ref=e72]
      - paragraph [ref=e73]: Ative a geolocalização para ver ofertas da sua região.
    - generic [ref=e76]:
      - heading "Comece agora" [level=2] [ref=e77]
      - paragraph [ref=e78]: Escaneie qualquer produto, compare preços e economize. Grátis, sem compromisso.
      - link "📷 Escanear agora" [ref=e79] [cursor=pointer]:
        - /url: /scanner
    - generic [ref=e80]:
      - paragraph [ref=e81]: © 2026 Preço Real
      - paragraph [ref=e82]: Comparador de preços inteligente para o consumidor brasileiro
  - alert [ref=e83]
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('Navegação — Header', () => {
  4   |   test('links do header navegam para páginas corretas', async ({ page }) => {
  5   |     await page.goto('/');
  6   | 
  7   |     const buscarLink = page.locator('header a[href="/busca"]');
> 8   |     await buscarLink.click();
      |                      ^ Error: locator.click: Test timeout of 30000ms exceeded.
  9   |     await expect(page).toHaveURL(/\/busca/);
  10  | 
  11  |     await page.goto('/');
  12  |     const scannerLink = page.locator('header a[href="/scanner"]');
  13  |     await scannerLink.click();
  14  |     await expect(page).toHaveURL(/\/scanner/);
  15  | 
  16  |     await page.goto('/');
  17  |     const lojistaLink = page.locator('header a[href="/lojista"]');
  18  |     await lojistaLink.click();
  19  |     await expect(page).toHaveURL(/\/lojista|\/login/);
  20  |   });
  21  | 
  22  |   test('header contém logo com link para home', async ({ page }) => {
  23  |     await page.goto('/');
  24  |     const logoLink = page.locator('a[href="/"]').first();
  25  |     await expect(logoLink).toBeVisible();
  26  |     await expect(logoLink).toContainText('Real');
  27  |   });
  28  | });
  29  | 
  30  | test.describe('Autenticação — Fluxo Login/Register', () => {
  31  |   test('página de login renderiza formulário', async ({ page }) => {
  32  |     await page.goto('/login');
  33  | 
  34  |     await expect(page.locator('h1')).toContainText('Entrar');
  35  |     await expect(page.locator('input[type="email"]')).toBeVisible();
  36  |     await expect(page.locator('input[type="password"]')).toBeVisible();
  37  |     await expect(page.locator('button[type="submit"]')).toBeVisible();
  38  |   });
  39  | 
  40  |   test('página de register renderiza alternador de tipo', async ({ page }) => {
  41  |     await page.goto('/register');
  42  | 
  43  |     await expect(page.locator('h1')).toContainText('Criar conta');
  44  |     const tipoBtns = page.locator('button[type="button"]');
  45  |     await expect(tipoBtns).toHaveCount(2);
  46  |     await expect(tipoBtns.nth(0)).toContainText('Consumidor');
  47  |     await expect(tipoBtns.nth(1)).toContainText('Lojista');
  48  |   });
  49  | 
  50  |   test('link de cadastro leva para /register', async ({ page }) => {
  51  |     await page.goto('/login');
  52  |     await page.getByRole('link', { name: 'Cadastre-se' }).click();
  53  |     await expect(page).toHaveURL(/\/register/);
  54  |   });
  55  | 
  56  |   test('link de login leva para /login', async ({ page }) => {
  57  |     await page.goto('/register');
  58  |     await page.getByRole('link', { name: 'Entrar' }).click();
  59  |     await expect(page).toHaveURL(/\/login/);
  60  |   });
  61  | 
  62  |   test('login submete formulário mesmo sem backend', async ({ page }) => {
  63  |     await page.goto('/login');
  64  | 
  65  |     await page.fill('input[type="email"]', 'teste@teste.com');
  66  |     await page.fill('input[type="password"]', '123456');
  67  | 
  68  |     await page.click('button[type="submit"]');
  69  |     await page.waitForTimeout(1000);
  70  | 
  71  |     const erroVisivel = await page.locator('text=Email ou senha inválidos').isVisible().catch(() => false);
  72  |     const aindaNoLogin = page.url().includes('/login');
  73  |     expect(erroVisivel || aindaNoLogin).toBe(true);
  74  |   });
  75  | 
  76  |   test('register submete formulário', async ({ page }) => {
  77  |     await page.goto('/register');
  78  | 
  79  |     await page.fill('input[placeholder="Seu nome"]', 'Teste User');
  80  |     await page.fill('input[type="email"]', 'novo@teste.com');
  81  |     await page.fill('input[placeholder*="Mínimo"]', '123456');
  82  |     await page.locator('button[type="button"]').first().click();
  83  | 
  84  |     await page.click('button[type="submit"]');
  85  |     await page.waitForTimeout(1000);
  86  | 
  87  |     const erroVisivel = await page.locator('text=Email já cadastrado').isVisible().catch(() => false);
  88  |     const aindaNoRegister = page.url().includes('/register');
  89  |     expect(erroVisivel || aindaNoRegister).toBe(true);
  90  |   });
  91  | });
  92  | 
  93  | test.describe('Busca — Interação', () => {
  94  |   test('input de busca renderiza e submete', async ({ page }) => {
  95  |     await page.goto('/busca');
  96  | 
  97  |     const input = page.locator('input[placeholder*="Nome"]');
  98  |     await expect(input).toBeVisible();
  99  | 
  100 |     await input.fill('arroz');
  101 |     await page.getByRole('button', { name: 'Buscar' }).click();
  102 | 
  103 |     await expect(page).toHaveURL(/busca=arroz/);
  104 |   });
  105 | 
  106 |   test('exibe estado vazio quando busca sem termo', async ({ page }) => {
  107 |     await page.goto('/busca');
  108 | 
```