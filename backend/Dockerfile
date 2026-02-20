# Backend Dockerfile
FROM node:20-alpine AS base

WORKDIR /app

# Dependencies
FROM base AS deps
COPY package.json yarn.lock* package-lock.json* ./
RUN npm ci --omit=dev

# Build
FROM base AS build
COPY package.json yarn.lock* package-lock.json* ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

# Production
FROM base AS runner
ENV NODE_ENV=production
RUN apk add --no-cache openssl
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/package.json ./

EXPOSE 3001
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
