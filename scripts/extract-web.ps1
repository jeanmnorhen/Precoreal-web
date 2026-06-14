$Source = "C:\Garagem\Escritorios\PrecoReal"
$Target = "C:\Garagem\Escritorios\precoreal-web"

Write-Host "=== Extraindo precoreal-web ===" -ForegroundColor Cyan

# Criar diretorio alvo
if (Test-Path $Target) { Remove-Item -Recurse -Force "$Target/*" -ErrorAction SilentlyContinue }
New-Item -ItemType Directory -Path $Target -Force | Out-Null

# Copiar codigo fonte
Copy-Item -Recurse "$Source/apps/web/app" "$Target/" -Force
Write-Host "  [OK] app/ copiado"

Copy-Item -Recurse "$Source/apps/web/components" "$Target/" -Force
Write-Host "  [OK] components/ copiado"

Copy-Item -Recurse "$Source/apps/web/lib" "$Target/" -Force
Write-Host "  [OK] lib/ copiado"

Copy-Item -Recurse "$Source/apps/web/public" "$Target/" -Force
Write-Host "  [OK] public/ copiado"

Copy-Item -Recurse "$Source/apps/web/e2e" "$Target/" -Force
Write-Host "  [OK] e2e/ copiado"

# Copiar arquivos de config
Copy-Item "$Source/apps/web/eslint.config.mjs" "$Target/" -Force
Copy-Item "$Source/apps/web/postcss.config.mjs" "$Target/" -Force
Copy-Item "$Source/apps/web/playwright.config.ts" "$Target/" -Force
Copy-Item "$Source/apps/web/next-env.d.ts" "$Target/" -Force

# Corrigir next.config.ts - remover transpilePackages (shared ja vem compilado do npm)
@'
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {};

export default nextConfig;
'@ | Out-File -FilePath "$Target/next.config.ts" -Encoding utf8
Write-Host "  [OK] next.config.ts criado (sem transpilePackages)"

# Corrigir vercel.json - agora e root-level, nao apps/web
@'
{
  "buildCommand": "npx next build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["gru1"]
}
'@ | Out-File -FilePath "$Target/vercel.json" -Encoding utf8
Write-Host "  [OK] vercel.json criado (paths ajustados)"

# Criar package.json
@'
{
  "name": "@precoreal/web",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug"
  },
  "dependencies": {
    "next": "16.2.9",
    "react": "19.2.4",
    "react-dom": "19.2.4",
    "@vercel/blob": "^0.23.4",
    "@precoreal/shared": "^1.0.0",
    "react-zxing": "^2.0.1"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.2.9",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
'@ | Out-File -FilePath "$Target/package.json" -Encoding utf8
Write-Host "  [OK] package.json criado"

# Criar tsconfig.json - sem paths manuais para shared
@'
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "forceConsistentCasingInFileNames": false,
    "paths": { "@/*": ["./*"] }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts",
    "**/*.mts"
  ],
  "exclude": ["node_modules"]
}
'@ | Out-File -FilePath "$Target/tsconfig.json" -Encoding utf8
Write-Host "  [OK] tsconfig.json criado (sem paths para shared)"

# Criar .gitignore
@'
# next.js
.next
out

# dependencies
/node_modules

# debugging
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# env
.env
.env*.local
.env*.local.example

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

# playwright
playwright-report
test-results
'@ | Out-File -FilePath "$Target/.gitignore" -Encoding utf8
Write-Host "  [OK] .gitignore criado"

# Criar .env.example
@'
# URL da API (backend NestJS)
NEXT_PUBLIC_API_URL=http://localhost:3000

# Armazenamento de Arquivos (Vercel Blob)
BLOB_READ_WRITE_TOKEN=
'@ | Out-File -FilePath "$Target/.env.example" -Encoding utf8
Write-Host "  [OK] .env.example criado"

Write-Host ""
Write-Host "=== precoreal-web extraido para: $Target ===" -ForegroundColor Green
Write-Host "Proximos passos:" -ForegroundColor Yellow
Write-Host "  cd $Target"
Write-Host "  npm install"
Write-Host "  # Configurar .env (NEXT_PUBLIC_API_URL)"
Write-Host "  npm run dev"
