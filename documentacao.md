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
| GET | /anuncios/proximos | Feed geo |
| POST | /scanner/resultado | Parse GS1 |
| POST | /stripe/webhook | Webhook pagamento |
| POST | /stripe/create-payment-intent | Criar pagamento |
| GET | /lojista/dashboard | Métricas lojista |
| POST | /lojista/creditos/comprar | Comprar créditos |
| GET | /metrics | Prometheus |

### Frontend

| Rota | Descrição |
|------|-----------|
| / | Landing page |
| /login | Login |
| /register | Cadastro |
| /busca | Busca produtos |
| /produtos/[id] | Detalhe + mapa + ofertas |
| /scanner | Scanner câmera |
| /lojista | Dashboard lojista |
| /lojista/produtos | Gestão produtos |
| /lojista/anuncios | Gestão anúncios |
| /lojista/creditos | Carteira créditos |

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
28 testes, 7 suites
```

| Suite | Testes |
|-------|--------|
| AuthService | register, login, me |
| StripeService | payment intent, circuit breaker, webhook |
| StripeController | defined |
| GeocachingService | cache hit, cache miss, fallback |
| LojistaService | dashboard, comprar créditos |
| AnunciosService | CRUD + NotFound |
| App (e2e) | hello, register conflict, login 401, geo |

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
