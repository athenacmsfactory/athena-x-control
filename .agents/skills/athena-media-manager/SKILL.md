---
name: athena-media-manager
description: Audit, repareert en downloadt media assets (afbeeldingen, logo's) voor Athena v9/v10 sites. Voorkom 404 errors met deze utility.
---

# Athena Media Manager Skill

Deze skill consolideert alle media-gerelateerde scripts uit `x-v9/athena/factory/6-utilities`. Gebruik deze skill als het doel is om afbeeldingen te fixen, media te migreren of ontbrekende bestanden op te sporen.

## Basis Pad
Alle scripts bevinden zich in: `/home/kareltestspecial/1-IT/4-pj/x-v9/athena/factory/6-utilities`

## Wanneer te gebruiken
- Je merkt `404 Not Found` errors op afbeeldingen in een gegenereerde of actieve site.
- Je moet media downloaden van een oude site (FPC, MPA, enz.) of externe bron.
- Je wilt een bulkcontrole (audit) doen op alle sites om te garanderen dat hun media-paden (Vooral in v10 Vite-projecten) correct zijn.
- Om lokaal ontbrekende afbeeldingen te identificeren en "op te dweilen" (mop-up).

## Essentiële Commando's / Scripts

Voer deze scripts uit met Node (vereist node versie 22+ via pnpm/nvm op een Chromebook).

### 1. Audits (Problemen vinden)
- **`bulk-image-audit.js`**: Controleert in bulk of afbeeldingen in de projecten correct gelinkt en aanwezig zijn.
- **`audit-media.js`**: Iets specifiekere check voor media.
- **`check-missing-images.js`**: Snelle controle op ontbrekende lokale bestanden.
- **`debug-page-images.js`**: Debug tool voor specifieke pagina's die geen afbeeldingen laden.

### 2. Resoluties / Fixes (Problemen oplossen)
- **`bulk-image-fix.js`**: De werkpaard-tool. Herspreekt paden (bijv. van absolute naar relatieve base-url aware paden in Vite) en repareert de JSON of compoenten.
- **`mop-up-images.js`**: Ruimt restanten op of "dweilt" problemen met bestandsnamen aan elkaar.
- **`update-all-logos.js`**: Werkt specifiek alle logo-paden in de projecten bij.

### 3. Fetching (Data of images ophalen)
- **`auto-media-fetcher.js`**: Algemeen script om ontbrekende media automatisch te zoeken en te downloaden.
- **`download-fpc-mpa-media.js`** / **`map-fpc-media.js`**: Specifiek voor scraping of mappen van het FPC-project naar lokale assets.
- **`download-page-images.js`**: Haalt algemeen alle media van een specifieke webpagina binnen.
- **`download-urban-soles-images.js`**: Project-specifieke fetcher (als case-voorbeeld of specifiek doel).

## Best Practices
- **Vite & Paden:** Houd in gedachten dat sinds v10 Vite wordt gebruikt en dynamische imports (of relatieve `assets/` mappen) base-url configuratie nodig hebben. Lees hiervoor ook de `remember-lessons` skill (`athena-v10-image-path-resolution.md`).
- **Voor dat je een bulk-fix draait:** Kijk altijd of de aanwezige image bestanden fysiek in de `/public` of `/src/assets` map van het betreffende project zitten.
