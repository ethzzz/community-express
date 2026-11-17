FROM node:22-alpine AS build
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@12.18.0 --activate
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter web build

FROM node:22-alpine AS runtime
RUN apk add --no-cache libc6-compat
WORKDIR /app/apps/web
ENV NODE_ENV=production
ENV API_BASE_INTERNAL=http://api:3000
ENV ADMIN_API_URL=http://admin-api:3002
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/apps/web/.next ./.next
COPY --from=build /app/apps/web/public ./public
COPY --from=build /app/apps/web/package.json ./package.json
COPY --from=build /app/apps/web/next.config.ts ./next.config.ts
EXPOSE 3001
CMD ["node", "/app/node_modules/next/dist/bin/next", "start", "-p", "3001"]
