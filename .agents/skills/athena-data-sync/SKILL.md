---
name: athena-data-sync
description: De Google Sheets I/O motor van Athena. Beheert de datastromen tussen Sheets, JSON, TSV en activeert provisionering van accounts.
---

# Athena Data Sync Skill

Deze skill indexeert de synchronisatiescripts uit `/home/kareltestspecial/1-IT/4-pj/x-v9/athena/factory/5-engine`. 
Dit is cruciaal voor de "data-gedreven" architectuur van Athena: het omzetten van ruwe data in sheets (of tsv's) naar bruikbare bronnen voor de frontend.

## Bi-directionele Sync
**Van Sheets naar lokaal:**
- `sync-sheet-to-json.js`, `sync-sheet-to-tsv.js`
- `sync-tsv-to-json.js`

**Van Lokaal naar Sheets:**
- `sync-json-to-sheet.js`, `sync-json-to-tsv.js`, `sync-tsv-to-sheet.js`
- `sync-full-project-to-sheet.js`
- `sync-sites-registry.js`

## Provisioning & Auth
Gebruik deze als er Google Cloud API authenticatie of Service Accounts aangemaakt/vernieuwd moeten worden voor datatoegang.
- `auto-sheet-provisioner.js`
- `provision-sheet-sa.js`
- `service-account-cleaner.js`
- `get-new-token.js`

**Richtlijn voor de AI:**
Als de data op het dashboard of in gemaakte sites niet overeenkomt met de bron (of de Google Sheets), start dan hier je onderzoek met een script als `sync-sheet-to-json.js`.
