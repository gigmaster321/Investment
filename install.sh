#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
# install.sh — One-time VPS provisioning for Quantum Investments
# Target: Ubuntu 24.04 LTS, 2 GB RAM Hostinger KVM VPS
#
# Run as root:  bash install.sh
# ═══════════════════════════════════════════════════════════════════════════════
set -euo pipefail

# ── Colour helpers ─────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
info()    { echo -e "${GREEN}[INFO]${NC} $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC} $*"; }
error()   { echo -e "${RED}[ERROR]${NC} $*"; exit 1; }
section() { echo -e "\n${GREEN}══════════════════════════════════════════${NC}"; \
            echo -e "${GREEN}  $*${NC}"; \
            echo -e "${GREEN}══════════════════════════════════════════${NC}"; }

[[ $EUID -ne 0 ]] && error "Run this script as root: sudo bash install.sh"

APP_DIR="/var/www/quantum-investments"
APP_USER="www-data"

# ── 1. System update ───────────────────────────────────────────────────────────
section "1/8  Updating system packages"
apt-get update -qq
apt-get upgrade -y -qq
apt-get install -y -qq curl wget git build-essential ca-certificates gnupg ufw

# ── 2. Node.js 20 LTS ─────────────────────────────────────────────────────────
section "2/8  Installing Node.js 20 LTS"
if ! command -v node &>/dev/null || [[ $(node -e "process.exit(process.version.split('.')[0].slice(1))"; echo $?) -ne 20 ]]; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y -qq nodejs
fi
info "Node.js $(node -v) installed"
info "npm $(npm -v) installed"

# ── 3. pnpm ───────────────────────────────────────────────────────────────────
section "3/8  Installing pnpm"
npm install -g pnpm@10 --quiet
info "pnpm $(pnpm -v) installed"

# ── 4. PM2 ────────────────────────────────────────────────────────────────────
section "4/8  Installing PM2"
npm install -g pm2 --quiet
pm2 install pm2-logrotate --quiet 2>/dev/null || true
pm2 set pm2-logrotate:max_size 50M    2>/dev/null || true
pm2 set pm2-logrotate:retain 7        2>/dev/null || true
pm2 set pm2-logrotate:compress true   2>/dev/null || true
info "PM2 $(pm2 -v) installed"

# ── 5. Nginx ──────────────────────────────────────────────────────────────────
section "5/8  Installing Nginx"
apt-get install -y -qq nginx
systemctl enable nginx
systemctl start nginx
info "Nginx $(nginx -v 2>&1 | grep -oP '[\d.]+') installed"

# ── 6. PostgreSQL ─────────────────────────────────────────────────────────────
section "6/8  Installing PostgreSQL 16"
apt-get install -y -qq postgresql postgresql-contrib
systemctl enable postgresql
systemctl start postgresql
info "PostgreSQL $(psql --version | awk '{print $3}') installed"

# Prompt for database credentials
echo ""
warn "You are about to create the application database."
read -rp "  Enter a strong database password: " -s DB_PASS; echo ""
[[ -z "$DB_PASS" ]] && error "Password cannot be empty."

# Create DB user and database
sudo -u postgres psql -c "
  DO \$\$
  BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'qinvest_user') THEN
      CREATE USER qinvest_user WITH PASSWORD '${DB_PASS}';
    ELSE
      ALTER USER qinvest_user WITH PASSWORD '${DB_PASS}';
    END IF;
  END
  \$\$;
" 2>/dev/null
sudo -u postgres psql -c "
  SELECT 'CREATE DATABASE qinvest_db OWNER qinvest_user'
  WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'qinvest_db')\gexec
" 2>/dev/null
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE qinvest_db TO qinvest_user;" 2>/dev/null
info "Database 'qinvest_db' and user 'qinvest_user' ready."

# ── 7. Application directory ──────────────────────────────────────────────────
section "7/8  Setting up application directory"
mkdir -p "$APP_DIR"
chown -R "$APP_USER":"$APP_USER" "$APP_DIR"
# Allow deploy user (current SSH user) to write to the directory
if [[ -n "${SUDO_USER:-}" ]]; then
  setfacl -R -m u:"$SUDO_USER":rwx "$APP_DIR" 2>/dev/null || \
    chown -R "$SUDO_USER":"$APP_USER" "$APP_DIR"
fi
info "Application directory: $APP_DIR"

# ── 8. Firewall ───────────────────────────────────────────────────────────────
section "8/8  Configuring firewall (ufw)"
ufw --force reset 2>/dev/null || true
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 'Nginx Full'   # 80 + 443
ufw --force enable
info "Firewall rules: SSH + Nginx (80/443) allowed"

# ── PM2 startup (runs on boot) ────────────────────────────────────────────────
PM2_STARTUP=$(pm2 startup systemd -u root --hp /root 2>&1 | grep "sudo env" || true)
if [[ -n "$PM2_STARTUP" ]]; then
  eval "$PM2_STARTUP" 2>/dev/null || true
fi

# ── Summary ───────────────────────────────────────────────────────────────────
section "Installation complete"
echo ""
info "Stack installed:"
echo "   Node.js  $(node -v)"
echo "   pnpm     $(pnpm -v)"
echo "   PM2      $(pm2 -v)"
echo "   Nginx    $(nginx -v 2>&1 | grep -oP '[\d.]+')"
echo "   PostgreSQL $(psql --version | awk '{print $3}')"
echo ""
warn "IMPORTANT — note these values for your .env file:"
echo "   DATABASE_URL=postgresql://qinvest_user:${DB_PASS}@localhost:5432/qinvest_db"
echo ""
info "Next step: cd $APP_DIR && copy your project files, fill in .env, then run: bash deploy.sh"
