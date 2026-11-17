FROM node:22-alpine AS build
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@12.18.0 --activate
COPY . .
ENV ADMIN_DATABASE_URL=mysql://root:root@localhost:3306/community_admin
RUN pnpm install --frozen-lockfile
RUN pnpm --filter admin-api exec prisma generate
RUN pnpm --filter admin-api build

FROM node:22-alpine AS runtime
RUN apk add --no-cache libc6-compat
WORKDIR /app/apps/admin-api
ENV NODE_ENV=production
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/apps/admin-api/dist ./dist
COPY --from=build /app/apps/admin-api/prisma ./prisma
COPY --from=build /app/apps/admin-api/package.json ./package.json
EXPOSE 3002
CMD ["node", "dist/main.js"]
