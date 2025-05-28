FROM node:18-alpine AS deps
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy dependency manifests and install deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

# Copy source
COPY . .

# Build registry and Next.js app directly
RUN pnpm shadcn build && pnpm build

FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
RUN npm install -g pnpm

COPY --from=deps /app/public ./public
COPY --from=deps /app/.next ./.next
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json

EXPOSE 3000

CMD ["pnpm", "start"]
