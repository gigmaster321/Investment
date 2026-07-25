#!/bin/sh
# Docker entrypoint for the Quantum Investments API server.
# Runs database migrations then hands off to the Express process.
set -e

echo "================================================"
echo "  Quantum Investments — API Server"
echo "================================================"
echo ""

echo "[1/2] Running database migrations..."
node migrate.mjs
echo "      Migrations complete."
echo ""

echo "[2/2] Starting API server on port ${PORT:-8080}..."
exec node server/index.mjs
