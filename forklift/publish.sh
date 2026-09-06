#!/bin/bash

# 🚀 Athena Publish Script (v2.0)
# Pusht de Vault naar GitHub — de athena-publisher-workflow bouwt, passeert
# de Fase 1c-kwaliteitspoort en publiceert de dist naar athena-cms-factory/<site>.
# (De lokale Published/-spiegel is afgeschaft: vault = bron, GitHub = live.)

SITE_NAME=$1
MESSAGE=$2

if [ -z "$SITE_NAME" ]; then
    echo "Usage: ./publish.sh <site_name> [commit_message]"
    exit 1
fi

VAULT_ROOT="/home/kareltestspecial/workspace/x-v9/vault"
VAULT_PATH="$VAULT_ROOT/$SITE_NAME"
if [ ! -d "$VAULT_PATH" ]; then
    echo "❌ Error: Site '$SITE_NAME' niet gevonden in Vault ($VAULT_PATH)."
    exit 1
fi

# 1. Push naar de live repo (Vault) — CI doet de rest (build + kwaliteitspoort + publish)
echo "🌐 Pushen naar GitHub Pages (via Vault Repo)..."
cd "$VAULT_ROOT"

# Controleer identiteit voor de zekerheid
ssh -T git@github.com 2>&1 | grep -q "Hi KarelTestSpecial" || { echo "❌ SSH Identiteit niet correct. Controleer gh auth."; exit 1; }

git add .
git commit -m "publish($SITE_NAME): ${MESSAGE:-'Final release'}"
git push origin main

echo "✅ Vault gepusht. De publisher-workflow bouwt + gate-checkt '$SITE_NAME' en zet hem live op https://athena-cms-factory.github.io/$SITE_NAME/"
