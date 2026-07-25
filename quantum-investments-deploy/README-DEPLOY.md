# Quantum Investments – Hostinger VPS Deployment Guide

## Package Contents

```
quantum-investments-deploy/
├── dist/               React frontend (static files – served by Nginx)
├── server/             Express API server (pre-bundled, no build step needed)
│   ├── index.mjs       Main server entry point
│   ├── pino-worker.mjs
│   ├── pino-file.mjs
│   ├── pino-pretty.mjs
│   └── thread-stream-worker.mjs
├── migrate.mjs         Database migration runner
├── package.json        npm start / npm run migrate
├── .env.example        Environment variable template
└── README-DEPLOY.md    This file
```

---

## Requirements

- **Node.js 20+**
- **PostgreSQL 13+**
- **Nginx** (reverse proxy + static file serving)
- **PM2** (keeps the Node process alive)

---

## Step-by-Step Deployment

### 1 — Upload this package to your VPS

```bash
# From your local machine:
scp quantum-investments-deploy.zip user@your-vps-ip:/var/www/
ssh user@your-vps-ip
cd /var/www && unzip quantum-investments-deploy.zip
mv quantum-investments-deploy quantum-investments
cd quantum-investments
```

### 2 — Install Node.js 20 (if not already installed)

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
```

### 3 — Create PostgreSQL database

```bash
sudo -u postgres psql <<EOF
CREATE USER qinvest_user WITH PASSWORD 'strong_password_here';
CREATE DATABASE qinvest_db OWNER qinvest_user;
GRANT ALL PRIVILEGES ON DATABASE qinvest_db TO qinvest_user;
EOF
```

### 4 — Configure environment variables

```bash
cp .env.example .env
nano .env   # fill in all values
chmod 600 .env
```

Generate a SESSION_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### 5 — Install dependencies and run migrations

```bash
npm install

# Load .env and run migrations
export $(grep -v '^#' .env | xargs)
npm run migrate
```

Expected output: `Schema applied successfully.`

### 6 — Start the API server with PM2

```bash
# Load env vars
export $(grep -v '^#' .env | xargs)

pm2 start server/index.mjs --name quantum-api

# Save PM2 config and enable auto-start on reboot
pm2 save
pm2 startup   # run the command it prints
```

Verify:
```bash
pm2 logs quantum-api --lines 20
# Should show: Server listening  port: 8080
# Should show: Admin account ready.
```

### 7 — Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/quantum-investments
```

Paste (replace `yourdomain.com`):

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    root /var/www/quantum-investments/dist;
    index index.html;

    # Proxy API requests to Express
    location /api/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Cookie $http_cookie;
        proxy_pass_header Set-Cookie;
    }

    # Proxy WordPress-compatible admin API routes
    location /wp-json/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Cookie $http_cookie;
        proxy_pass_header Set-Cookie;
    }

    # SPA fallback — all other routes serve index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
}
```

Enable and test:
```bash
sudo ln -s /etc/nginx/sites-available/quantum-investments /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 8 — Enable HTTPS (Let's Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### 9 — Verify

```bash
curl https://yourdomain.com/api/healthz    # → 200 OK
curl -I https://yourdomain.com/            # → 200, text/html
```

---

## Updating the App

When you receive a new `quantum-investments-deploy.zip`:

```bash
cd /var/www/quantum-investments

# Replace files (keep your .env)
unzip -o /path/to/new-quantum-investments-deploy.zip
# If schema changed:
export $(grep -v '^#' .env | xargs) && npm run migrate

pm2 restart quantum-api
```

---

## Quick Reference

| Command | Purpose |
|---|---|
| `npm install` | Install runtime dependency (`pg`) |
| `npm run migrate` | Create / update database tables |
| `npm start` | Start the API server (port from `PORT` env var) |
| `pm2 restart quantum-api` | Reload server after an update |
| `pm2 logs quantum-api` | View live server logs |
