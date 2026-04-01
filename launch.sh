#!/bin/bash
# 🔱 Athena x-v9 Root Launcher
# Starts the decentralized API and Dashboard UI

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

# Config paths
API_DIR="../athena/factory/athena-api"
UI_DIR="dashboard"
LOG_DIR="../athena/output/logs"
PM_CLI="../athena/factory/cli/pm-cli.js"

# Maak log directory aan
mkdir -p "$LOG_DIR"
TIMESTAMP=$(date +%Y-%m-%d)
LOG_FILE_API="$LOG_DIR/${TIMESTAMP}_athena_api.log"
LOG_FILE_UI="$LOG_DIR/${TIMESTAMP}_athena_ui.log"

# Ports
API_PORT=5000
UI_PORT=5001

# Clean up existing processes
NODE_BIN=$(command -v node)
if [ -f "$PM_CLI" ]; then
    $NODE_BIN "$PM_CLI" stop $API_PORT
    $NODE_BIN "$PM_CLI" stop $UI_PORT
fi
sleep 1

echo "🔱 Starting Athena API on port $API_PORT..."
cd "$API_DIR"
pnpm start > "$PROJECT_ROOT/$LOG_FILE_API" 2>&1 &
cd "$PROJECT_ROOT"

echo "🌐 Starting Athena Dashboard UI on port $UI_PORT..."
cd "$UI_DIR"
pnpm dev --port $UI_PORT > "$PROJECT_ROOT/$LOG_FILE_UI" 2>&1 &
cd "$PROJECT_ROOT"

echo "⏳ Waiting for servers to initialize (10s)..."
sleep 10


# Open browser
USER_DATA_DIR="/home/kareltestspecial/.chrome-linux-profile"
mkdir -p "$USER_DATA_DIR"

URL="http://localhost:$UI_PORT"
echo "✅ Dashboard launched! Access at: $URL"
echo "   - API Log: $LOG_FILE_API"
echo "   - UI Log: $LOG_FILE_UI"

if [ -f "/opt/google/chrome/google-chrome" ]; then
    /opt/google/chrome/google-chrome --user-data-dir="$USER_DATA_DIR" --new-window "$URL" --no-first-run --no-default-browser-check &
else
    xdg-open "$URL"
fi
