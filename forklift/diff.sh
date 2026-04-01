#!/bin/bash

# Forklift Diff Script
# Shows differences between Vault and Playground

SITE_NAME=$1

if [ -z "$SITE_NAME" ]; then
    echo "Usage: $0 <site_name>"
    exit 1
fi

if [[ "$SITE_NAME" == *"/"* ]] || [[ "$SITE_NAME" == *".."* ]]; then
    echo "Error: Invalid site name '$SITE_NAME'. No slashes or dots allowed."
    exit 1
fi

VAULT_PATH="/home/kareltestspecial/0-IT/3-DEV/y1/sites/$SITE_NAME"
PLAYGROUND_PATH="/home/kareltestspecial/0-IT/3-DEV/y1/y/werkplaats/$SITE_NAME"

if [ ! -d "$VAULT_PATH" ]; then
    echo "Error: Site '$SITE_NAME' not found in Vault ($VAULT_PATH)."
    exit 1
fi

if [ ! -d "$PLAYGROUND_PATH" ]; then
    echo "Error: Site '$SITE_NAME' not found in Playground ($PLAYGROUND_PATH)."
    exit 1
fi

echo "Comparing Vault and Playground for '$SITE_NAME'..."
diff -r --exclude='node_modules' --exclude='.git' "$VAULT_PATH" "$PLAYGROUND_PATH"
