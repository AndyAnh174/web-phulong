# Dockerfile cho ứng dụng Next.js
FROM node:18-alpine AS base

# Cài đặt dependencies chỉ khi cần thiết
FROM base AS deps
# Kiểm tra https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine để hiểu tại sao libc6-compat có thể cần thiết.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Cài đặt dependencies với npm legacy peer deps
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps

# Rebuild source code chỉ khi cần thiết
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js thu thập dữ liệu telemetry hoàn toàn ẩn danh về việc sử dụng chung.
# Tìm hiểu thêm tại: https://nextjs.org/telemetry
# Bỏ comment dòng sau để tắt telemetry trong quá trình build.
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# Production image, copy tất cả files và chạy next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
# Bỏ comment dòng sau để tắt telemetry trong runtime.
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set quyền chính xác cho prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Tự động leverage output traces để giảm kích thước image
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 8080

ENV PORT=8080
ENV HOSTNAME="0.0.0.0"

# server.js được tạo bởi next build từ output standalone
CMD ["node", "server.js"] 