FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/backend/package.json apps/backend/
COPY packages/shared/package.json packages/shared/
RUN npm ci --workspaces --ignore-scripts

COPY . .
RUN npm run build -w @precoreal/shared
RUN npm run build -w @precoreal/backend

FROM node:22-alpine AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nest

COPY --from=builder /app/node_modules node_modules
COPY --from=builder /app/apps/backend/dist apps/backend/dist
COPY --from=builder /app/apps/backend/package.json apps/backend/
COPY --from=builder /app/packages/shared/dist packages/shared/dist
COPY --from=builder /app/packages/shared/package.json packages/shared/

USER nest
EXPOSE 3001

ENV NODE_ENV=production
CMD ["node", "apps/backend/dist/main"]
