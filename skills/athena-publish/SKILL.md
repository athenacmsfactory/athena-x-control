# Athena Publish Skill

Deze skill bevat de procedure voor het definitief publiceren van een site vanuit de Vault naar de live GitHub Pages omgeving.

## Wanneer te gebruiken
Gebruik deze skill wanneer een site in de **Vault** volledig gereed is bevonden voor publieke release of wanneer een belangrijke update live moet gaan.

## De Procedure

### Stap 1: Publish Script uitvoeren
Het script pusht de Vault-repository naar GitHub. De **athena-publisher-workflow** in CI doet daarna automatisch de rest: build → **Fase 1c-kwaliteitspoort** (HTML-lint, build-check, Lighthouse-drempels) → dist naar de publieke repo `athena-cms-factory/<site>` → live op `https://athena-cms-factory.github.io/<site>/`.

**Commando:**
```bash
bash /home/kareltestspecial/workspace/x-v9/control/forklift/publish.sh <site-name> "[optioneel commit bericht]"
```

### Stap 2: Verificatie
Volg de GitHub Actions-run (`Athena Y1 Publisher` in `athenacmsfactory/athena-x-vault`) en check na afloop of de site live is op de bijbehorende URL. Blokkeert de kwaliteitspoort, dan faalt de run vóór de publicatie: fix eerst de gerapporteerde fouten.

## Waarom deze procedure?
- **Vault = bron van waarheid**: de privé-monorepo `athenacmsfactory/athena-x-vault` bevat alle site-sources (en zit in de wekelijkse versleutelde MACCHA-backup).
- **Kwaliteit gegarandeerd**: niets gaat live zonder de poort te passeren — de autopilot kan geen fouten versterken.
- **Geen lokale kopieën nodig** (beslissing Karel 6/9): de oude `Published/`-spiegel is afgeschaft.

## Belangrijke Regels
1. **Vault-only**: Publiceer NOOIT direct vanuit de Factory (athena/sites). Gebruik altijd eerst de Forklift (`push.sh`) om naar de Vault te promoveren.
2. **Org**: alle live sites wonen in de org **`athena-cms-factory`** — nooit naar andere orgs pushen.
