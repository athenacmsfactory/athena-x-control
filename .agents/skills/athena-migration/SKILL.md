---
name: athena-migration
description: Scripts gebruikt voor het migreren, repareren en upgraden van componenten en configuraties over meerdere Athena v9/v10 sites in bulk.
---

# Athena Migration Skill

Deze map indexeert refactoring, upgrade en migratie utilities gelegen in `/home/kareltestspecial/1-IT/4-pj/x-v9/athena/factory/6-utilities`.

## Upgraden en Migraties
Bij architectuur wijzigingen worden vaak deze tools ingezet (Draai bijvoorkeur NA een backup):

- **`batch-upgrade-components.js`**
- **`batch-upgrade-multiverse.js`**
- **`batch-upgrade-editable-text.js`**
- **`upgrade-sites-theming.js`**: Vaak gebruikt bij overstappen naar een nieuw CSS of thema systeem.

## Reparaties (Fixes)
Voor het rechttrekken van code fouten of routing problemen na een v10 migratie:

- **`bulk-fix-dependencies.js`**: Helpt als NPM / PNPM of `package.json` zaken scheef staan na de overstap naar v10 Vite structuur.
- **`bulk-fix-project-name.js`**
- **`bulk-fix-router.js`**
- **`fix-section-ids.js`** / **`fix-footers.js`** / **`cleanup-footers.js`**
- **`repair-v10.js`**
- **`repair-bindings.js`**
- **`repair-dockframe.js`**

## Connecties & Headers
- **`update-all-connectors.js`**
- **`update-all-headers.js`**
- **`patch-all-grids.cjs`**

## Belangrijke AI Workflow Richtlijn
Wanneer de gebruiker vraagt om bijvoorbeeld "in alle sites module X te updaten", moet je NIET direct 50 bestanden handmatig openen. Gebruik de kennis dat de scripts hierboven al bestaan. Bijvoorbeeld, als we de thema's moeten aanpassen, is `upgrade-sites-theming.js` mogelijk al voorbereid om precies dat te doen met een simpele opdracht.
