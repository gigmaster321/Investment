# ═══════════════════════════════════════════════════════════════════════════════
# Stage 1 — Builder
# Installs all workspace dependencies and compiles both the React frontend
# and the Express backend bundle.
# ═══════════════════════════════════════════════════════════════════════════════
# Use the glibc-based image because the workspace lockfile includes Rollup's
# linux-x64-gnu native binary and intentionally excludes the musl variant.
FROM node:20-bookworm-slim AS builder

# Install the same pnpm major version used in development
RUN npm install -g pnpm@10

WORKDIR /app

# Copy workspace manifests first — maximises Docker layer cache.
# If only source files change, this layer (pnpm install) is reused.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY tsconfig.base.json tsconfig.json ./

# Copy every package.json in the workspace so pnpm can resolve the graph
# before any source code is present.
COPY lib/db/package.json                ./lib/db/
COPY lib/api-spec/package.json          ./lib/api-spec/
COPY lib/api-zod/package.json           ./lib/api-zod/
COPY lib/api-client-react/package.json  ./lib/api-client-react/
COPY artifacts/quantum-investments/package.json  ./artifacts/quantum-investments/
COPY artifacts/api-server/package.json           ./artifacts/api-server/

RUN pnpm install --frozen-lockfile

# Copy all source code (node_modules excluded via .dockerignore)
COPY lib/          ./lib/
COPY artifacts/    ./artifacts/
COPY attached_assets/ ./attached_assets/

# Build the React SPA → /app/dist/
RUN pnpm --filter @workspace/quantum-investments run build

# Build the Express server bundle → /app/artifacts/api-server/dist/
RUN pnpm --filter @workspace/api-server run build


# ═══════════════════════════════════════════════════════════════════════════════
# Stage 2 — App
# Minimal production image that runs database migrations then starts Express.
# ═══════════════════════════════════════════════════════════════════════════════
FROM node:20-bookworm-slim AS app

WORKDIR /app

# Copy the esbuild-bundled server files (all deps are inlined)
COPY --from=builder /app/artifacts/api-server/dist ./server

# The production domain is proxied to Express, so the API image also needs the
# compiled SPA that Express serves for / and client-side routes.
COPY --from=builder /app/dist ./dist

# Copy the migration runner — it imports pg directly, so pg must be installed
COPY --from=builder /app/lib/db/src/migrate.mjs ./migrate.mjs

# Create a minimal package.json and install only pg (needed by migrate.mjs)
RUN echo '{"name":"quantum-investments","version":"1.0.0","type":"module","dependencies":{"pg":"^8.22.0"}}' \
    > package.json && npm install --omit=dev --no-audit --no-fund

# Copy and configure the startup script
COPY docker-entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

ENV NODE_ENV=production

EXPOSE 8080

ENTRYPOINT ["./entrypoint.sh"]


# ═══════════════════════════════════════════════════════════════════════════════
# Stage 3 — Nginx
# Serves the compiled React SPA as static files and proxies /api to the app.
# The nginx config is volume-mounted by docker-compose so it can be swapped
# from HTTP → HTTPS without rebuilding this image.
# ═══════════════════════════════════════════════════════════════════════════════
FROM nginx:1.27-alpine AS nginx-stage

# Copy the compiled React SPA
COPY --from=builder /app/dist /usr/share/nginx/html

# Remove the default nginx welcome page config
RUN rm -f /etc/nginx/conf.d/default.conf

EXPOSE 80 443
