$Source = "C:\Garagem\Escritorios\PrecoReal"
$Target = "C:\Garagem\Escritorios\precoreal-backend"

Write-Host "=== Extraindo precoreal-backend ===" -ForegroundColor Cyan

# Criar diretorio alvo
if (Test-Path $Target) { Remove-Item -Recurse -Force "$Target/*" -ErrorAction SilentlyContinue }
New-Item -ItemType Directory -Path $Target -Force | Out-Null

# Copiar codigo fonte
Copy-Item -Recurse "$Source/apps/backend/src" "$Target/" -Force
Write-Host "  [OK] src/ copiado"

Copy-Item -Recurse "$Source/apps/backend/test" "$Target/" -Force
Write-Host "  [OK] test/ copiado"

Copy-Item -Recurse "$Source/apps/backend/drizzle" "$Target/" -Force
Write-Host "  [OK] drizzle/ (migrations) copiado"

# Copiar arquivos de config
Copy-Item "$Source/apps/backend/Dockerfile" "$Target/" -Force
Copy-Item "$Source/apps/backend/.dockerignore" "$Target/" -Force
Copy-Item "$Source/apps/backend/nest-cli.json" "$Target/" -Force
Copy-Item "$Source/apps/backend/drizzle.config.ts" "$Target/" -Force
Copy-Item "$Source/apps/backend/.prettierrc" "$Target/" -Force
Copy-Item "$Source/apps/backend/eslint.config.mjs" "$Target/" -Force
Write-Host "  [OK] arquivos de config copiados"

# Copiar docker-compose.yml da raiz
$compose = Get-Content "$Source/docker-compose.yml" -Raw
$compose = $compose -replace 'context: \.', 'context: .'
$compose = $compose -replace 'dockerfile: apps/backend/Dockerfile', 'dockerfile: Dockerfile'
$compose | Out-File -FilePath "$Target/docker-compose.yml" -Encoding utf8
Write-Host "  [OK] docker-compose.yml criado"

# Criar package.json
@'
{
  "name": "@precoreal/backend",
  "version": "1.0.0",
  "description": "API NestJS do Preco Real",
  "private": true,
  "license": "UNLICENSED",
  "scripts": {
    "build": "nest build",
    "dev": "nest start --watch",
    "start": "nest start",
    "start:prod": "node dist/apps/backend/src/main",
    "lint": "eslint \"{src,test}/**/*.ts\" --fix",
    "test": "jest",
    "test:e2e": "jest --config ./test/jest-e2e.json",
    "db:generate": "drizzle-kit generate",
    "db:push": "drizzle-kit push",
    "db:migrate": "drizzle-kit migrate",
    "db:studio": "drizzle-kit studio",
    "db:seed": "npx tsx src/seed.ts"
  },
  "dependencies": {
    "@nestjs/bullmq": "^10.1.1",
    "@nestjs/common": "^11.0.1",
    "@nestjs/config": "^3.2.2",
    "@nestjs/core": "^11.0.1",
    "@nestjs/jwt": "^11.0.2",
    "@nestjs/platform-fastify": "^11.0.1",
    "@precoreal/shared": "^1.0.0",
    "@types/bcrypt": "^6.0.0",
    "@vercel/blob": "^0.23.4",
    "bcrypt": "^6.0.0",
    "bullmq": "^5.8.3",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.14.1",
    "drizzle-orm": "^0.30.10",
    "ioredis": "^5.4.1",
    "pg": "^8.11.5",
    "reflect-metadata": "^0.2.2",
    "rxjs": "^7.8.1",
    "stripe": "^15.12.0"
  },
  "devDependencies": {
    "@eslint/eslintrc": "^3.2.0",
    "@eslint/js": "^9.18.0",
    "@nestjs/cli": "^11.0.0",
    "@nestjs/schematics": "^11.0.0",
    "@nestjs/testing": "^11.0.1",
    "@types/jest": "^30.0.0",
    "@types/node": "^24.0.0",
    "@types/pg": "^8.11.6",
    "@types/supertest": "^7.0.0",
    "drizzle-kit": "^0.21.4",
    "eslint": "^9.18.0",
    "eslint-config-prettier": "^10.0.1",
    "eslint-plugin-prettier": "^5.2.2",
    "globals": "^17.0.0",
    "jest": "^30.0.0",
    "prettier": "^3.4.2",
    "source-map-support": "^0.5.21",
    "supertest": "^7.0.0",
    "ts-jest": "^29.2.5",
    "ts-loader": "^9.5.2",
    "ts-node": "^10.9.2",
    "tsconfig-paths": "^4.2.0",
    "tsx": "^4.0.0",
    "typescript": "^5.7.3",
    "typescript-eslint": "^8.20.0"
  },
  "jest": {
    "moduleFileExtensions": ["js", "json", "ts"],
    "rootDir": "src",
    "testRegex": ".*\\.spec\\.ts$",
    "transform": { "^.+\\.(t|j)s$": "ts-jest" },
    "collectCoverageFrom": ["**/*.(t|j)s"],
    "coverageDirectory": "../coverage",
    "testEnvironment": "node"
  }
}
'@ | Out-File -FilePath "$Target/package.json" -Encoding utf8
Write-Host "  [OK] package.json criado"

# Criar tsconfig.json
@'
{
  "compilerOptions": {
    "module": "commonjs",
    "moduleResolution": "node",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2022",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": true,
    "forceConsistentCasingInFileNames": false,
    "noImplicitAny": true,
    "strictBindCallApply": true,
    "noFallthroughCasesInSwitch": true
  }
}
'@ | Out-File -FilePath "$Target/tsconfig.json" -Encoding utf8
Write-Host "  [OK] tsconfig.json criado"

# Criar tsconfig.build.json
@'
{
  "extends": "./tsconfig.json",
  "exclude": ["node_modules", "test", "dist", "**/*spec.ts"]
}
'@ | Out-File -FilePath "$Target/tsconfig.build.json" -Encoding utf8
Write-Host "  [OK] tsconfig.build.json criado"

# Criar .env.example
@'
# Servidor
PORT=3000

# Banco de Dados PostgreSQL + PostGIS
DATABASE_URL=postgresql://precoreal:postgres@localhost:5432/precoreal

# Cache e Filas Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Gateway de Pagamentos (Stripe)
STRIPE_RESTRICTED_KEY=sua_chave_aqui

# Chave Secreta JWT (trocar em producao)
JWT_SECRET=precoreal-secret-dev

# Webhook Stripe (obter em Stripe Dashboard)
STRIPE_WEBHOOK_SECRET=whsec_...

# Armazenamento de Arquivos (Vercel Blob)
BLOB_READ_WRITE_TOKEN=

# Sentry (opcional)
SENTRY_DSN_BACKEND=
'@ | Out-File -FilePath "$Target/.env.example" -Encoding utf8
Write-Host "  [OK] .env.example criado"

# Criar .gitignore
@'
node_modules
dist
*.tsbuildinfo
.env
*.log
stderr.txt
stdout.txt
coverage
'@ | Out-File -FilePath "$Target/.gitignore" -Encoding utf8
Write-Host "  [OK] .gitignore criado"

Write-Host ""
Write-Host "=== precoreal-backend extraido para: $Target ===" -ForegroundColor Green
Write-Host "Proximos passos:" -ForegroundColor Yellow
Write-Host "  cd $Target"
Write-Host "  npm install"
Write-Host "  # Configurar .env"
Write-Host "  npm run db:push       # criar tabelas no banco"
Write-Host "  npm run db:seed       # popular dados de teste"
Write-Host "  npm run dev           # http://localhost:3000"
