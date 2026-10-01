---
name: athena-core-build
description: De zware bouw- en transformatie motor (Athenafier, Scrapers, MPA generator). Gebruik om te doorgronden hoe sites worden geproduceerd of gemuteerd.
---

# Athena Core Build Skill

Deze skill indexeert het hart van het Athena-fabricatieproces, gepositioneerd in `/home/kareltestspecial/1-IT/4-pj/x-v9/athena/factory/5-engine`. 

## De Fabricage Engine
Dit zijn de kritieke paders (heavy-lifters):
- **`athenafier.js`**: Centraliseert waarschijnlijk de transformatielogica voor een kaal project richting het "Athena/v9/v10" formaat.
- **`mpa-generator.js`**: Genereert Multi-Page Applications vanuit configuraties.
- **`layout-visualizer.js`**: Bouwt grafische/markup representaties van layout configuraties in de cloud/sheets.

## Mappers en Connectoren
- **`media-mapper.js`**: Uiterst zwaar script (24KB) dat paden / FPC media en andere assets intern verbindt en mapped naar juiste exports.
- **`dock-connector.js`**: Waarschijnlijk de brug tussen de Engine en 'The Dock' of de `1-Infrastructuur` modules voor resource linking.
- **`sitetype-from-site-generator.js`**

## Scrapers
Worden gebruikt om data in de pijplijn te trekken vanaf bestaande (oude) sites:
- **`athena-scraper.js`**
- **`split-scraper-data.js`**

**Richtlijn voor de AI:**
Als er structurele fouten optreden in de HTML/Vite uitvoer van een nieuwe site (geen kleine CSS bugs, maar het ontbreken van hele routerings-lagen of structurele mappings), dan treden fouten doorgaans op in de omvangrijke logica van `athenafier.js` of de `mpa-generator.js`.
