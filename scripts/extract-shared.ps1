$Source = "C:\Garagem\Escritorios\PrecoReal"
$Target = "C:\Garagem\Escritorios\precoreal-shared"

Write-Host "=== Extraindo precoreal-shared ===" -ForegroundColor Cyan

# Criar diretorio alvo
if (Test-Path $Target) { Remove-Item -Recurse -Force "$Target/*" -ErrorAction SilentlyContinue }
New-Item -ItemType Directory -Path $Target -Force | Out-Null

# Copiar codigo fonte
Copy-Item -Recurse "$Source/packages/shared/src" "$Target/" -Force
Write-Host "  [OK] src/ copiado"

# Criar tsconfig.json
@'
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
'@ | Out-File -FilePath "$Target/tsconfig.json" -Encoding utf8
Write-Host "  [OK] tsconfig.json criado"

# Criar package.json
@'
{
  "name": "@precoreal/shared",
  "version": "1.0.0",
  "description": "Tipos compartilhados, schema Drizzle e parser GS1 do Preco Real",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": ["dist"],
  "license": "MIT",
  "scripts": {
    "build": "tsc",
    "dev": "tsc -w",
    "prepublishOnly": "npm run build",
    "version": "npm run build && git add -A dist"
  },
  "dependencies": {
    "drizzle-orm": "^0.30.10"
  },
  "devDependencies": {
    "typescript": "^5.4.5"
  },
  "publishConfig": {
    "access": "public"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/anomalyco/precoreal-shared.git"
  },
  "keywords": ["preco-real", "drizzle", "gs1", "ecommerce"]
}
'@ | Out-File -FilePath "$Target/package.json" -Encoding utf8
Write-Host "  [OK] package.json criado"

# Criar .npmignore
@'
node_modules
dist/*.tsbuildinfo
src
'@ | Out-File -FilePath "$Target/.npmignore" -Encoding utf8
Write-Host "  [OK] .npmignore criado"

# Criar .gitignore
@'
node_modules
dist
*.tsbuildinfo
'@ | Out-File -FilePath "$Target/.gitignore" -Encoding utf8
Write-Host "  [OK] .gitignore criado"

# Criar README.md
@'
# @precoreal/shared

Tipos compartilhados, schema Drizzle ORM e parser GS1 do ecossistema Preco Real.

## Uso

```bash
npm install @precoreal/shared
```

```ts
import { produtos, anuncios } from '@precoreal/shared';
import { GS1ApplicationParser } from '@precoreal/shared';
```

## Desenvolvimento

```bash
npm install
npm run build    # compila src/ → dist/
npm run dev      # watch mode
```

## Publicacao

```bash
npm version patch
npm publish
```
'@ | Out-File -FilePath "$Target/README.md" -Encoding utf8
Write-Host "  [OK] README.md criado"

Write-Host ""
Write-Host "=== precoreal-shard extraido para: $Target ===" -ForegroundColor Green
Write-Host "Proximos passos:" -ForegroundColor Yellow
Write-Host "  cd $Target"
Write-Host "  npm install"
Write-Host "  npm run build"
Write-Host "  npm publish --access public"
