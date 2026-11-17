FROM node:22-alpine AS build
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@12.18.0 --activate
COPY . .
ENV DATABASE_URL=mysql://root:root@localhost:3306/community
RUN pnpm install --frozen-lockfile
RUN pnpm --filter api exec prisma generate
RUN pnpm --filter api build

FROM node:22-alpine AS runtime
RUN apk add --no-cache libc6-compat
WORKDIR /app/apps/api
ENV NODE_ENV=production
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/apps/api/prisma ./prisma
COPY --from=build /app/apps/api/prisma.config.ts ./prisma.config.ts
COPY --from=build /app/apps/api/package.json ./package.json
EXPOSE 3000
CMD ["node", "dist/server.js"]
