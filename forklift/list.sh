#!/bin/bash

# Forklift List Script
# Shows an overview of sites in Vault and Werkplaats

VAULT_DIR="/home/kareltestspecial/0-IT/3-DEV/y1/sites"
WERKPLAATS_DIR="/home/kareltestspecial/0-IT/3-DEV/y1/y/werkplaats"

echo "--------------------------------------------------------"
echo "📦 FORKLIFT SITE OVERVIEW"
echo "--------------------------------------------------------"
printf "%-30s | %-12s | %-12s\n" "Site Name" "Vault" "Werkplaats"
echo "--------------------------------------------------------"

# Get all unique site names from both directories
ALL_SITES=$(ls -1 "$VAULT_DIR" "$WERKPLAATS_DIR" 2>/dev/null | sort -u)

for site in $ALL_SITES; do
    if [ -d "$VAULT_DIR/$site" ]; then vault="✅" ; else vault="❌" ; fi
    if [ -d "$WERKPLAATS_DIR/$site" ]; then werk="✅" ; else werk="❌" ; fi
    
    printf "%-30s | %-12s | %-12s\n" "$site" "$vault" "$werk"
done

echo "--------------------------------------------------------"
echo "Legend: ✅ = Exists, ❌ = Missing"
echo "--------------------------------------------------------"
