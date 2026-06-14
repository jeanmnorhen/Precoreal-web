# PreçoReal

Plataforma de comparação de preços com geolocalização que conecta consumidores a lojas locais. Escaneie códigos de barras, compare preços e encontre as melhores ofertas perto de você.

## Stack

| Camada | Tecnologia |
|---|---|
| **Monorepo** | Turborepo + npm workspaces |
| **Frontend** | Next.js 16 (App Router) + React 19 |
| **Backend** | NestJS 11 (Fastify) |
| **Linguagem** | TypeScript 5 |
| **Estilo** | Tailwind CSS v4 |
| **ORM** | Drizzle ORM |
| **Banco** | PostgreSQL 16 + PostGIS 3.4 |
| **Cache/Fila** | Redis 7 + BullMQ |
| **Pagamento** | Stripe |
| **Monitoramento** | Sentry + Prometheus |
| **Testes E2E** | Playwright |
| **Testes unitários** | Jest |

## Estrutura

```
precoreal/
├── apps/
│   ├── backend/          # API NestJS (porta 3001)
│   │   ├── src/          # Módulos: auth, usuarios, lojas, produtos,
│   │   │                 # anuncios, geo, stripe, scanner, filas
│   │   ├── drizzle/      # Migrações do banco
│   │   └── test/         # Testes E2E (Jest + supertest)
│   └── web/              # Frontend Next.js (porta 3000)
│       ├── app/          # Páginas (App Router)
│       ├── components/   # Componentes reutilizáveis
│       ├── lib/          # API client, contexto de auth
│       └── e2e/          # Testes Playwright
├── packages/
│   └── shared/           # Schema Drizzle, parser GS1, tipos
├── skills/               # Base de conhecimento para dev
├── docker-compose.yml    # PostGIS + Redis + Backend
├── documentacao.md       # Documentação técnica detalhada
└── turbo.json            # Pipeline Turborepo
```

## Funcionalidades

### Consumidor
- Leitor de código de barras (EAN-13, GS1 DataMatrix) com `react-zxing`
- Busca de produtos por nome, marca ou código de barras
- Feed de ofertas geolocalizadas, ordenadas por distância
- Mapa com ofertas próximas (Leaflet)
- Autenticação JWT (registro/login)

### Lojista
- Dashboard com estatísticas (lojas, anúncios ativos, total)
- Cadastro de lojas com endereço e coordenadas (PostGIS)
- Gerenciamento de produtos no catálogo
- Criação e gerenciamento de anúncios com raio de alcance
- Compra de créditos via Stripe
- Sidebar no desktop, navegação inferior no mobile

### Sistema
- **Multitenancy** — anúncios e lojas escopados por `lojaId` via JWT
- **Geo caching** — Redis com Geohash (precisão 5, ~4.89km, 9 vizinhos), fallback para PostGIS
- **Circuit breaker** — Stripe: 3 falhas consecutivas abrem circuito por 20s
- **Degradação graciosa** — Redis indisponível → PostGIS; PostGIS indisponível → feed popular
- **Idempotência** — interceptador global com `X-Idempotency-Key`, lock atômico Redis NX
- **Filas** — BullMQ para notificações e impressões, retry com backoff exponencial
- **Observabilidade** — Sentry, Prometheus (`GET /metrics`), Pino logger com UUIDs

## Pré-requisitos

- Node.js 22+ e npm 11+
- Docker (para PostgreSQL + Redis)

## Desenvolvimento

```bash
# Instalar dependências
npm install

# Subir banco e cache
docker compose up -d postgres redis

# Aplicar migrações
npm run db:migrate -w @precoreal/backend

# Iniciar dev (frontend + backend com hot-reload)
npm run dev
```

O frontend abre em `http://localhost:3000` e a API em `http://localhost:3001`.

### Comandos por workspace

```bash
# Backend
npm run dev -w @precoreal/backend         # watch mode
npm run test -w @precoreal/backend        # testes unitários
npm run test:e2e -w @precoreal/backend    # testes E2E
npm run db:studio -w @precoreal/backend   # Drizzle Studio

# Frontend
npm run dev -w @precoreal/web             # Next.js dev
npm run test:e2e -w @precoreal/web        # Playwright
npm run test:e2e:ui -w @precoreal/web     # Playwright UI
```

### Migrações

```bash
npm run db:generate -w @precoreal/backend   # gerar migração
npm run db:push -w @precoreal/backend       # push direto (dev)
npm run db:migrate -w @precoreal/backend    # aplicar migrações
```

## Testes

```bash
npm test                  # todos os testes (via Turbo)
npm run test:e2e -w @precoreal/web     # Playwright (3 projetos: Desktop, Tablet, Mobile)
```

## Deploy

### Frontend → Vercel
O frontend faz deploy automático via Vercel a partir do GitHub. Configuração em `vercel.json`.

### Backend → Docker
```bash
docker compose up -d --build
```

A API roda em `postgres`, `redis` e `backend` containers. Variáveis de ambiente configuradas via `docker-compose.yml` ou ambiente da VPS.

## Variáveis de Ambiente

```env
DATABASE_URL=postgres://user:senha@localhost:5432/precoreal
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=sua-chave-secreta
STRIPE_RESTRICTED_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
SENTRY_DSN=https://...
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
```

## Esquema do Banco

Tabelas principais (`packages/shared/src/db/schema.ts`):

| Tabela | Descrição |
|---|---|
| `usuarios` | Usuários (consumidor/lojista), saldo de créditos |
| `lojas` | Lojas com endereço e ponto geográfico (PostGIS) |
| `produtos` | Catálogo global de produtos, código de barras único |
| `anuncios` | Anúncios por loja, com raio de alcance e status |

## Licença

MIT
