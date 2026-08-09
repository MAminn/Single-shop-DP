FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm install -g pnpm@9.15.4

# Install dependencies (including devDeps needed for build)
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN NODE_ENV=development pnpm install --frozen-lockfile

# Build the app, then drop devDependencies to shrink the runtime image
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN NODE_ENV=production pnpm run build \
  && pnpm prune --prod

# Production runtime
FROM base AS runner
# postgresql-client-16 (not Debian's default v15) — pg_dump refuses to run
# against a server on a *newer* major version than itself, and this project's
# Postgres is v16 (see docker-compose.yml). Pulled from the official PGDG apt
# repo since Debian bookworm's own repo only ships v15.
RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates gnupg lsb-release \
  && curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc | gpg --dearmor -o /usr/share/keyrings/postgresql.gpg \
  && echo "deb [signed-by=/usr/share/keyrings/postgresql.gpg] http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list \
  && apt-get update && apt-get install -y --no-install-recommends postgresql-client-16 \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/build ./build
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/shared ./shared
COPY --from=builder /app/backend ./backend
COPY --from=builder /app/assets ./assets
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/drizzle.config.ts ./drizzle.config.ts

RUN mkdir -p /app/uploads

EXPOSE 3000

CMD ["pnpm", "start"]
