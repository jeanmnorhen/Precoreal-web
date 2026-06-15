# PreçoReal

Plataforma de comparação de preços com geolocalização que conecta consumidores a lojas locais. Escaneie códigos de barras, compare preços e encontre as melhores ofertas perto de você. Suporta 4 perfis de usuário: **Consumidor**, **Lojista**, **Funcionário** e **Administrador**.

## Stack

| Camada | Tecnologia |
|---|---|
| **Monorepo** | Turborepo + npm workspaces |
| **Frontend** | Next.js 16 (App Router) + React 19 + Tailwind CSS v4 |
| **Backend** | NestJS 11 (Fastify) |
| **Linguagem** | TypeScript 5 |
| **ORM** | Drizzle ORM |
| **Banco** | PostgreSQL 16 + PostGIS 3.4 |
| **Cache/Fila** | Redis 7 + BullMQ |
| **Pagamento** | Stripe |
| **Gráficos** | Lightweight Charts (TradingView) |
| **Monitoramento** | Sentry + Prometheus |
| **Testes** | Jest (unitários) + Playwright (E2E) |

## Estrutura

```
precoreal/
├── apps/
│   ├── backend/          # API NestJS (porta 3001)
│   │   ├── src/
│   │   │   ├── admin/        # Módulo admin (dashboard, precos, uso)
│   │   │   ├── anuncios/     # CRUD anúncios + regras por tipo
│   │   │   ├── auth/         # JWT, guards (4 tipos), decorators
│   │   │   ├── db/           # DatabaseService, ScopedAnuncioRepository
│   │   │   ├── funcionario/  # Módulo funcionário (geofencing + turnos)
│   │   │   ├── geo/          # Geocaching (Redis + PostGIS)
│   │   │   ├── lojista/      # Dashboard + funcionários CRUD
│   │   │   ├── produtos/     # Catálogo global
│   │   │   ├── stripe/       # Pagamento + webhook
│   │   │   └── ...           # usuarios, lojas, scanner, filas
│   │   ├── drizzle/      # Migrações do banco
│   │   └── test/         # Testes E2E (Jest + supertest)
│   └── web/              # Frontend Next.js (porta 3000)
│       ├── app/          # Páginas (App Router)
│       │   ├── admin/        # Dashboard, Preços, Uso
│       │   ├── funcionario/  # Dashboard, Produtos, Anúncios
│       │   ├── lojista/      # Dashboard, Anúncios, Funcionários
│       │   └── ...           # Home, Busca, Scanner, Login
│       ├── components/   # Componentes reutilizáveis
│       ├── lib/          # API client, auth-context
│       └── middleware.ts # Proteção de rotas por role
├── packages/
│   ├── api-client/       # Cliente HTTP centralizado
│   ├── api-contracts/    # Tipos request/response
│   └── shared/           # Schema Drizzle, parser GS1
├── docker-compose.yml    # PostGIS + Redis + Backend
├── documentacao.md       # Documentação técnica detalhada
└── turbo.json            # Pipeline Turborepo
```

## Funcionalidades

### Consumidor
- Leitor de código de barras (EAN-13, GS1 DataMatrix) com `react-zxing`
- Busca de produtos por nome, marca ou código de barras
- Feed de ofertas geolocalizadas com badges por tipo (📢 Oferta, 🔥 Promoção, ⚡ Relâmpago)
- Mapa com ofertas próximas (Leaflet)
- Autenticação JWT (registro/login)
- Scanner com fluxo de confirmação → busca de ofertas

### Lojista
- Dashboard com estatísticas (lojas, anúncios ativos, total)
- Cadastro de lojas com endereço e coordenadas (PostGIS)
- Gerenciamento de produtos no catálogo
- Criação de anúncios com tipo dinâmico (regras de validade, créditos e raio)
- Gerenciamento de funcionários (adicionar por email, definir turnos, remover)
- Compra de créditos via Stripe
- Sidebar no desktop, navegação inferior no mobile

### Funcionário
- Autenticação com geolocalização + verificação de horário de trabalho
- Verificação contínua a cada 30s (geofencing por PostGIS + turnos)
- Visualização de produtos e anúncios da loja vinculada
- Multi-loja: seleção de loja ao entrar

### Administrador
- Dashboard com métricas agregadas (usuários ativos, total ofertas, novas lojas, pendências)
- Gráfico de preços (Lightweight Charts, linha) com filtro 7d/30d/90d
- Gráfico de uso (Lightweight Charts, histograma) + top 10 produtos
- Revisão de produtos pendentes

### Sistema
- **4 perfis JWT** — `consumidor`, `lojista`, `funcionario`, `admin` com guards específicos
- **Multitenancy** — anúncios e lojas escopados por `lojaId` via JWT (Scope.REQUEST)
- **Geofencing** — PostGIS `ST_DWithin` + polígonos + verificação de turnos (dia da semana + hora)
- **Tipos de Anúncio**: `oferta` (15d, 1créd, 3km), `promocao` (7d, 3créd, 5km), `promocao_relampago` (3d, 5créd, 10km)
- **Geo caching** — Redis com Geohash (precisão 5, ~4.89km, 9 vizinhos), fallback para PostGIS
- **Circuit breaker** — Stripe: 3 falhas consecutivas abrem circuito por 20s
- **Degradação graciosa** — Redis indisponível → PostGIS; PostGIS indisponível → feed popular
- **Idempotência** — interceptador global com `X-Idempotency-Key`, lock atômico Redis NX
- **Filas** — BullMQ para notificações e impressões, retry com backoff exponencial
- **Observabilidade** — Sentry, Prometheus (`GET /metrics`), Pino logger com UUIDs

## Precificação

| Item | Valor |
|---|---|
| **1 crédito** | R$ 1,00 |
| **Formas de pagamento** | Débito, crédito ou PIX (via Stripe) |
| **Custo mínimo por tipo** | Oferta: 1 crédito/dia · Promoção: 3 créditos/dia · Promoção Relâmpago: 5 créditos/dia |

Os créditos são comprados pelo lojista na página `Carteira de Créditos` e consumidos diariamente por cada anúncio ativo.

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
| `usuarios` | Usuários (consumidor/lojista/funcionario/admin), saldo de créditos |
| `lojas` | Lojas com endereço, ponto geográfico (PostGIS), perímetro e raio |
| `funcionariosLojas` | Vínculo funcionário→loja com turnos (JSON) |
| `produtos` | Catálogo global, código de barras único, status de revisão |
| `anuncios` | Anúncios por loja com tipo (oferta/promocao/promocao_relampago), raio e status |

## Licença

MIT
