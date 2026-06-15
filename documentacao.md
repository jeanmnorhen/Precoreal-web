# Documentação Técnica — Preço Real

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Backend | NestJS 11 + Fastify |
| Frontend | Next.js 16 (App Router) + Tailwind v4 |
| ORM | Drizzle ORM |
| Banco | PostgreSQL + PostGIS |
| Cache/Fila | Redis + BullMQ |
| Pagamento | Stripe |
| Error Tracking | Sentry |
| Métricas | Prometheus (prom-client) |
| Logger | Pino |
| Monorepo | Turborepo + npm workspaces |
| Mobile (futuro) | React Native / Expo |

## Estrutura do Monorepo

```
precoreal/
├── apps/
│   ├── backend/          # API NestJS (Fastify, porta 3001)
│   └── web/              # Frontend Next.js (porta 3000)
├── packages/
│   └── shared/           # Schema Drizzle, parser GS1, tipos
├── docker-compose.yml    # PostGIS + Redis + Backend
├── vercel.json           # Config deploy frontend
└── documentacao.md
```

## Iterações Completas

### Iteração 1 — Auth + CRUD
- Auth JWT (register, login, me, JwtAuthGuard, @CurrentUser)
- CRUD Usuários, Lojas (com PostGIS), Produtos, Anúncios
- Storage upload endpoint

### Iteração 2 — Filas, Webhook, Geo, Scanner
- BullMQ workers: notificações, impressões
- Webhook Stripe com creditamento de saldo
- GET /anuncios/proximos (cache geo)
- GET /produtos/codigo/:codigoBarras
- POST /scanner/resultado (GS1 parser)

### Iteração 3 — Web Consumer
- AuthContext + API client (`lib/api.ts`)
- Páginas: Login, Register, Busca, Produto (com geo), Scanner
- Header auth-aware

### Iteração 4 — Portal Lojista
- Backend: LojistaModule (dashboard, compra créditos, LojistaGuard)
- Frontend: Layout sidebar, Dashboard, Produtos CRUD, Anúncios (ativar/pausar), Carteira de créditos

### Iteração 5 — Observabilidade & PWA
- Sentry (backend + frontend)
- Circuit breaker para Stripe (3 falhas → 20s timeout)
- Graceful degradation: Redis/PostGIS fallback
- Prometheus metrics endpoint
- PWA: manifest, service worker, ícones
- Pino logger com request IDs

### Iteração 6 — Roles & Permissions (Admin + Funcionário)
- Schema: enum `tipoUsuario` com 4 valores, `funcionariosLojas` table, `perimetro`/`perimetroRaioMetros`, `tipo` em anuncios, `statusRevisao` em produtos
- AdminModule: Guard, Controller (`GET /dashboard`, `GET /precos`, `GET /uso`), Service (agregações + revisão)
- FuncionarioModule: Guard (permite funcionario + lojista), Controller (`GET /lojas`, `POST verificar-acesso/:lojaId`, `GET :lojaId/produtos|anuncios`), Service (geofencing ST_DWithin + turnos)
- LojistaModule extendido: CRUD funcionários (adicionar por email, turnos, remover)
- API Client: métodos admin.*, funcionario.*, lojista.funcionarios.*
- Regras de negócio `validarRegrasAnuncio()` no AnunciosService

### Iteração 7 — Frontend Completo (4 perfis)
- Consumidor: search-bar, category-filters, offer-card (badges por tipo), feed-promocoes (horizontal), feed-ofertas (vertical), scanner com confirmação
- Lojista: seleção de loja, sidebar, gerenciamento de funcionários com modais, formulário de anúncios com tipo dinâmico (validade/créditos/raio auto-ajustados)
- Funcionário: seleção de loja via API, verificação contínua geo+tempo (30s interval), painel com produtos e anúncios
- Admin: dashboard com 4 widgets, gráfico de preços (Lightweight Charts linha), gráfico de uso (Lightweight Charts histograma) + top 10

### Iteração 8 — Polimento
- Middleware de proteção de rotas (Next.js middleware.ts com cookie JWT)
- Redirect por tipo no login/register (consumidor→/, lojista→/lojista, etc.)
- Limpeza de componentes obsoletos (ofertas-feed, header antigo)
- Seed expandido: admin, funcionário, tipos de anúncio, geofencing, revisão pendente

## Rotas da Aplicação

### Backend (porta 3001)

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | / | Health check |
| POST | /auth/register | Cadastro |
| POST | /auth/login | Login |
| GET | /auth/me | Dados do usuário logado |
| GET/POST | /usuarios | CRUD |
| GET/POST | /lojas | CRUD |
| GET/POST | /produtos | CRUD |
| GET | /produtos/codigo/:codigoBarras | Busca por barras |
| GET/POST/PATCH/DELETE | /anuncios | CRUD scoped |
| GET | /anuncios/proximos | Feed geo (filtro `?tipo=`) |
| POST | /scanner/resultado | Parse GS1 |
| POST | /stripe/webhook | Webhook pagamento |
| POST | /stripe/create-payment-intent | Criar pagamento |
| GET | /lojista/dashboard | Métricas lojista |
| POST | /lojista/creditos/comprar | Comprar créditos |
| GET | /lojista/funcionarios | Listar funcionários por loja |
| POST | /lojista/funcionarios | Adicionar funcionário |
| PATCH | /lojista/funcionarios/:id/turnos | Atualizar turnos |
| DELETE | /lojista/funcionarios/:id | Remover funcionário |
| GET | /funcionario/lojas | Lojas vinculadas |
| POST | /funcionario/verificar-acesso/:lojaId | Verificar geo + horário |
| GET | /funcionario/:lojaId/produtos | Produtos da loja |
| GET | /funcionario/:lojaId/anuncios | Anúncios ativos da loja |
| GET | /admin/dashboard | Métricas admin |
| GET | /admin/precos | Preços (filtro ?produtoId, ?regiao, ?periodo) |
| GET | /admin/uso | Uso (filtro ?periodo) |
| GET | /metrics | Prometheus |

### Frontend

| Rota | Role | Descrição |
|------|------|-----------|
| / | todos | Landing page com feeds de ofertas |
| /login | público | Login |
| /register | público | Cadastro |
| /busca | público | Busca produtos |
| /produtos/[id] | público | Detalhe + mapa + ofertas |
| /scanner | público | Scanner câmera |
| /lojista | lojista | Dashboard |
| /lojista/produtos | lojista | Gestão produtos |
| /lojista/anuncios | lojista | Gestão anúncios |
| /lojista/selecionar | lojista | Seleção de loja |
| /lojista/anuncios/adicionar | lojista | Novo anúncio (com tipo) |
| /lojista/funcionarios | lojista | Gerenciar funcionários |
| /lojista/creditos | lojista | Carteira créditos |
| /funcionario | funcionario | Dashboard |
| /funcionario/selecionar | funcionario | Seleção de loja |
| /funcionario/produtos | funcionario | Produtos da loja |
| /funcionario/anuncios | funcionario | Anúncios ativos |
| /admin | admin | Dashboard com métricas |
| /admin/precos | admin | Gráfico de preços |
| /admin/uso | admin | Gráfico de uso |

## Arquitetura Multi-tenant

Shared schema com scoping via `ScopedAnuncioRepository` que injeta `lojaId` extraído do JWT em todas as queries. Produtos são catálogo global (sem scoping). Apenas Anúncios e Lojas são scoped por tenant.

## Resiliência

### Circuit Breaker (Stripe)
- 3 falhas consecutivas → circuito abre por 20s
- Mensagem amigável: "Serviço temporariamente indisponível"

### Graceful Degradation
- Redis indisponível → fallback para PostgreSQL
- PostGIS indisponível → feed de ofertas populares (sem geo)
- Cache geo salvo com TTL de 5 min

## Idempotência

Interceptor global no Fastify verifica `X-Idempotency-Key` no Redis:
- `PENDING` → 409 Conflict
- `SUCCESS` → retorna resposta cacheada
- Ausente → processa e salva

## Observabilidade

- **Logs:** Pino + request ID único (`crypto.randomUUID`)
- **Erros:** Sentry (backend + frontend)
- **Métricas:** `GET /metrics` no backend (Prometheus)
- **Health check:** `GET /` no backend

## Testes

```
~80+ testes, 14 suites
```

| Suite | Testes |
|-------|--------|
| AuthService | register, login, me |
| AdminService | dashboard (zerado/com dados), monitoramentoPrecos, monitoramentoUso |
| AdminGuard | admin permite, consumidor/lojista/funcionario 403, sem user 403 |
| AdminController | dashboard, precos, uso (com/sem filtros) |
| FuncionarioService | verificarAcesso: sem vínculo 404, permitido, fora horário, fora perímetro, erro DB |
| FuncionarioGuard | funcionario/lojista permite, consumidor/admin 403, sem user 403 |
| FuncionarioController | listarLojas, verificarAcesso, listarProdutos, listarAnuncios |
| AnunciosService | CRUD + NotFound + regras por tipo (10 cenários: oferta/promocao/relâmpago) |
| LojistaService | dashboard, comprarCreditos, listar/adicionar/atualizarTurnos/remover funcionários |
| StripeService | payment intent, circuit breaker, webhook |
| StripeController | defined |
| GeocachingService | cache hit, cache miss, fallback |
| App (e2e) | hello, auth (register/login 401, register admin), admin (403 sem token), funcionario (401), lojista funcionarios (401), anuncios (proximos, tipo) |

### Comandos

```bash
cd apps/backend
npm test            # Unitários
npm run test:e2e    # E2E
npm run test:cov    # Cobertura
```

## Migrations (Drizzle Kit)

```bash
cd apps/backend
npm run db:generate   # Gera migration do schema
npm run db:push       # Push direto (dev)
npm run db:migrate    # Aplica migrations pendentes
npm run db:studio     # Drizzle Studio (GUI)
```

Config em `apps/backend/drizzle.config.ts`, schema em `packages/shared/src/db/schema.ts`.

## Deploy

### Frontend (Vercel)
- Link: https://precoreal-web.vercel.app
- Deploy automático via git (conectado ao GitHub)
- Config: `vercel.json` na raiz

### Backend (Coolify / VPS)
- Dockerfile: `apps/backend/Dockerfile` (multi-stage, alpine)
- Orquestração: `docker-compose.yml` (PostGIS + Redis + Backend)
- Porta: 3001 (pode ser exposta via reverse proxy)

### Variáveis de Ambiente

```env
DATABASE_URL=postgres://user:pass@host:5432/precoreal
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=...
STRIPE_RESTRICTED_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
SENTRY_DSN=https://...
```

## PWA

- Manifest: `/manifest.json`
- Service Worker: `/sw.js`
- Tema: `#16a34a` (verde)
- Ícones SVG em `/icons/`
- Registro automático via `ServiceWorkerRegister` component

## Decisões Técnicas

| Decisão | Motivo |
|---------|--------|
| JWT manual sem Passport | Compatibilidade com Fastify |
| rawBody no Fastify | Necessário para webhook Stripe |
| @nestjs/bullmq v10 API | `@Processor({ settings })` + `concurrency` |
| react-zxing v2 API | `onDecodeResult` / `onDecodeError` |
| dynamic import Leaflet | Evita erro SSR (window is not defined) |
| Drizzle em vez de Prisma | SQL-first, sem engine pesada, tipagem estática |
| 4 roles JWT (`consumidor`/`lojista`/`funcionario`/`admin`) | Evita complexidade RBAC externo; guards simples por papel |
| FuncionarioGuard permite lojista | Lojista pode visualizar dados da loja como funcionário |
| ScopedAnuncioRepository (Scope.REQUEST) | Injeta `lojaId` do JWT em queries sem poluir controllers |
| Lightweight Charts em vez de Chart.js | Menor bundle, melhor performance em gráficos financeiros |
| PostGIS ST_DWithin + raio em metros | Geofencing funcionário sem necessidade de polígono complexo |
| Turnos como JSON array em `funcionariosLojas` | Flexível (dias/horários variados), sem tabela separada |
| 3 tipos de anúncio com regras fixas | Regras de negócio validadas no backend; frontend apenas reflete |
