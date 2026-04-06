#!/bin/bash

# 🚜 Forklift Push Script (v2.0)
# Syncs data from the Playground (Werkplaats) back to the Vault
# Now with Flag Support for AI-Automation

SITE_NAME=""
AUTO_CONFIRM=false
AUTO_PURGE=false

# Parse arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        -y|--yes) AUTO_CONFIRM=true ;;
        -p|--purge) AUTO_PURGE=true ;;
        *) if [ -z "$SITE_NAME" ]; then SITE_NAME=$1; else echo "Unknown parameter: $1"; exit 1; fi ;;
    esac
    shift
done

if [ -z "$SITE_NAME" ]; then
    echo "Usage: ./push.sh <site_name> [-y|--yes] [-p|--purge]"
    exit 1
fi

# Safety Check: Prevent path traversal
if [[ "$SITE_NAME" == *"/"* ]] || [[ "$SITE_NAME" == *".."* ]]; then
    echo "❌ Error: Invalid site name '$SITE_NAME'. No slashes or dots allowed."
    exit 1
fi

VAULT_PATH="/home/kareltestspecial/0-IT/4-pj/x-v9/vault/$SITE_NAME"
PLAYGROUND_PATH="/home/kareltestspecial/0-IT/4-pj/x-v9/athena/sites/$SITE_NAME"

if [ ! -d "$PLAYGROUND_PATH" ]; then
    echo "❌ Error: Site '$SITE_NAME' not found in Werkplaats ($PLAYGROUND_PATH)."
    exit 1
fi

echo "🚀 Pushing '$SITE_NAME' from Werkplaats to Vault..."

# Confirmation Logic
if [ "$AUTO_CONFIRM" = true ]; then
    CONFIRM="y"
else
    echo "⚠️  WARNING: This will promote your changes to the permanent storage."
    read -p "Are you sure you want to promote these changes? (y/N): " CONFIRM
fi

if [[ "$CONFIRM" =~ ^[Yy]$ ]]; then
    mkdir -p "$VAULT_PATH"
    rsync -av --exclude 'node_modules' --exclude '.git' "$PLAYGROUND_PATH/" "$VAULT_PATH/"
    echo "✅ Push complete. Changes have been promoted to the Vault."
    
    # Purge Logic
    if [ "$AUTO_PURGE" = true ]; then
        PURGE="y"
    else
        read -p "Do you want to purge (delete) '$SITE_NAME' from the Werkplaats? (y/N): " PURGE
    fi

    if [[ "$PURGE" =~ ^[Yy]$ ]]; then
        rm -rf "$PLAYGROUND_PATH"
        echo "✅ Site '$SITE_NAME' has been purged from Werkplaats."
        
        # Git Integration (Check if we are in a git repo)
        if [ -d "$PLAYGROUND_PATH/../../.git" ]; then
             echo "🏗️  Staging deletions to Git..."
             cd "$PLAYGROUND_PATH/../.."
             git add -u .
             git commit -m "park: $SITE_NAME to Vault" || echo "Nothing to commit in Werkplaats"
        fi
    else
        echo "💡 Site '$SITE_NAME' remains in Werkplaats for further editing."
    fi
else
    echo "🚫 Push cancelled."
fi
