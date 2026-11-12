# Multi-stage Dockerfile for ReTech Backend API
FROM node:22-alpine AS builder

WORKDIR /app

# Install pnpm directly via npm matching packageManager
RUN npm install -g pnpm@9.15.0

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile=false

COPY . .
RUN pnpm run build

# Production runtime stage
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=10000

RUN npm install -g pnpm@9.15.0

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --prod --frozen-lockfile=false

COPY --from=builder /app/dist ./dist

EXPOSE 10000

CMD ["node", "dist/server.js"]
