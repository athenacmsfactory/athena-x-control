---
name: athena-site-generator
description: Bevat instructies over scripts voor het genereren van nieuwe sites, showcaselijsten en pipelines binnen de Athena Factory.
---

# Athena Site Generator Skill

Deze skill indexeert de generatie- en creatiescripts binnen `/home/kareltestspecial/1-IT/4-pj/x-v9/athena/factory/6-utilities`. 

**BELANGRIJK:** Verplaats deze JS scripts nooit! Sommige van deze scripts worden mogelijk aangeroepen door de Athena backend (API) of via cronjobs gerelateerd aan het Athena Dashboard.

## Kernscripts

- **`generate-site.js`** / **`quick-create.js`**: Basis scripts voor het bootstrappen van nieuwe projecten.
- **`generate-sitetype-from-input.js`**: Generatie op basis van specifieke parameters of inputs.
- **`factory-runner.js`**: Vermoedelijk gebruikt als CLI of script-runner om geautomatiseerde pipelines af te trappen voor nieuwe sites.
- **`generate-showcase.js`** / **`automatic-showcase-generator.js`**: Scripts om overzichten of 'showcase' data te genereren van actieve projecten.
- **`export-site-to-sheets.js`** / **`rename-sheets-tab.js`**: Koppelingen met Google Sheets voor administratie.

## Hoe te gebruiken door de AI

- Als de gebruiker vraagt om "de showcase te updaten", weet ik dat `generate-showcase.js` de tool is om aan te bevelen.
- Als er via de terminal snel een site opgebouwd moet worden buiten de UI om, kijk naar `quick-create.js`.
