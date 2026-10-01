---
name: athena-gapps-proxy
description: Beheert Google Apps Scripts (GS) gerelateerde code, uploader UI's en de Master Proxy infrastructuur voor Sheets.
---

# Athena G-Apps Proxy Skill

Deze skill indexeert de componenten die zich binnen `/home/kareltestspecial/1-IT/4-pj/x-v9/athena/factory/5-engine` bevinden en dienen als backbone voor Google Apps Script (GAS) integraties.

## De GAS Core
Dit zijn de bronbestanden voor de Cloud-side scripts (Vaak handmatig of via Clasp naar appsscript.google.com gepusht). De bijbehorende `.md` bestanden dienen vermoedelijk als documentatie/handleiding voor elke functie.
- **`GS-MASTER_PROXY.gs`**: Het hoofdscript / proxy ontvangstpunt aan de Google kant.
- **`GS-ClientDeployer.gs`**
- **`GS-ImageHelper.gs`**
- **`GS-LinkGenerator.gs`**

## Interface (GAS UI)
- **`UploaderUI.html`**: Browser formulier dat draait binnen het Google Apps Script venster (bijv. als Sidebar of Modal in docs/sheets) voor media uploads.

**Richtlijn voor de AI:**
Als er errors optreden bij het *opslaan* van wijzigingen aan de Athena-sites via het Google platform (of wanneer de "Uploader" in Sheets niet reageert), check dan deze `.gs` bestanden op CORS issues of foute POST afhandeling.
