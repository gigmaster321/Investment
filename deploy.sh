#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
# deploy.sh — Build and deploy Quantum Investments
# Target: Ubuntu 24.04 LTS, 2 GB RAM Hostinger KVM VPS
#
# Run from the project root:  bash deploy.sh
# Works for both first-time deployments and updates.
# ═══════════════════════════════════════════════════════════════════════════════
set -euo pipefail

# ── Colour helpers ─────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
info()    { echo -e "${GREEN}[INFO]${NC} $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC} $*"; }
error()   { echo -e "${RED}[ERROR]${NC} $*"; exit 1; }
step()    { echo -e "\n${CYAN}▸ $*${NC}"; }

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$APP_DIR/.env"
ECOSYSTEM="$APP_DIR/ecosystem.config.js"

step "Quantum Investments — Deployment Script"
echo "  Directory: $APP_DIR"
echo "  Date:      $(date)"
echo ""

# ── Pre-flight checks ─────────────────────────────────────────────────────────
[[ ! -f "$ENV_FILE" ]] && error ".env file not found. Copy .env.example to .env and fill in all values."
[[ ! -f "$ECOSYSTEM" ]] && error "ecosystem.config.js not found in $APP_DIR"

command -v node  &>/dev/null || error "Node.js not found. Run install.sh first."
command -v pnpm  &>/dev/null || error "pnpm not found. Run install.sh first."
command -v pm2   &>/dev/null || error "PM2 not found. Run install.sh first."

NODE_VER=$(node -e "process.exit(+process.version.split('.')[0].slice(1) < 20 ? 1 : 0)" 2>&1 && echo "ok" || echo "fail")
[[ "$NODE_VER" == "fail" ]] && error "Node.js 20+ required. Found: $(node -v)"

info "Pre-flight checks passed (Node $(node -v), pnpm $(pnpm -v), PM2 $(pm2 -v))"

# ── Load environment ──────────────────────────────────────────────────────────
step "Loading environment variables"
set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a
info ".env loaded"

# ── Install dependencies ──────────────────────────────────────────────────────
step "Installing workspace dependencies"
cd "$APP_DIR"
pnpm install --frozen-lockfile
info "Dependencies installed"

# ── Build frontend ────────────────────────────────────────────────────────────
step "Building React frontend (Vite)"
# Limit Node.js heap to 1.5 GB to leave room for OS + Postgres on a 2 GB VPS
NODE_OPTIONS="--max-old-space-size=1536" \
  pnpm --filter @workspace/quantum-investments run build
info "Frontend built → dist/"

# ── Build backend ─────────────────────────────────────────────────────────────
step "Building Express backend (esbuild)"
pnpm --filter @workspace/api-server run build
info "Backend built → artifacts/api-server/dist/"

# ── Run database migrations ───────────────────────────────────────────────────
step "Running database migrations"
pnpm --filter @workspace/db run migrate
info "Migrations applied"

# ── Start / reload PM2 ───────────────────────────────────────────────────────
step "Starting / reloading PM2 process"
# pm2 startOrReload: starts on first run, performs zero-downtime reload on updates
pm2 startOrReload "$ECOSYSTEM" --env production
pm2 save
info "PM2 process started/reloaded"

# ── Reload Nginx ──────────────────────────────────────────────────────────────
step "Testing and reloading Nginx"
nginx -t && systemctl reload nginx
info "Nginx reloaded"

# ── Health check ──────────────────────────────────────────────────────────────
step "Running health check"
sleep 3   # Give the server a moment to fully initialize
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/api/healthz 2>/dev/null || echo "000")
if [[ "$HTTP_CODE" == "200" ]]; then
  info "API health check passed (HTTP $HTTP_CODE)"
else
  warn "Health check returned HTTP $HTTP_CODE — check logs: pm2 logs quantum-api"
fi

# ── Summary ───────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}══════════════════════════════════════════${NC}"
echo -e "${GREEN}  Deployment complete!${NC}"
echo -e "${GREEN}══════════════════════════════════════════${NC}"
echo ""
pm2 list
echo ""
info "Useful commands:"
echo "   pm2 logs quantum-api       — live server logs"
echo "   pm2 monit                  — process monitor"
echo "   pm2 restart quantum-api    — restart server"
echo "   nginx -t                   — test nginx config"
echo "   systemctl reload nginx     — apply nginx changes"
