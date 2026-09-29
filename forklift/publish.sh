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

# Controleer identiteit voor de zekerheid: verifieer dat de SSH-host van de
# vault-remote (github-athena) ons als het factory-account herkent voordat we pushen.
REMOTE_HOST=$(git remote get-url origin | sed -E 's|^[^@]+@([^:]+):.*|\1|')
EXPECTED_ACCOUNT="athenacmsfactory"
ACTUAL_ACCOUNT=$(ssh -T "git@$REMOTE_HOST" 2>&1 | sed -nE 's/^Hi ([^!]+)!.*/\1/p')
if [ "$ACTUAL_ACCOUNT" != "$EXPECTED_ACCOUNT" ]; then
    echo "❌ SSH-identiteit onjuist: verwacht '$EXPECTED_ACCOUNT' via $REMOTE_HOST, kreeg '${ACTUAL_ACCOUNT:-onbekend}'. Controleer gh auth."
    exit 1
fi

git add .
git commit -m "publish($SITE_NAME): ${MESSAGE:-'Final release'}"
git push origin main

echo "✅ Vault gepusht. De publisher-workflow bouwt + gate-checkt '$SITE_NAME' en zet hem live op https://athena-cms-factory.github.io/$SITE_NAME/"
