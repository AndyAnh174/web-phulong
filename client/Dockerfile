# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN npm install --legacy-peer-deps

COPY . .
COPY .env.production .env.local

RUN rm -f .env.local

RUN npm run build

# Stage 2: Run
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.env.production ./.env.production

RUN npm install --legacy-peer-deps --production

EXPOSE 8080

CMD ["npx", "next", "start", "-p", "8080"] 