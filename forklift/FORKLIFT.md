# 🚜 Forklift Architectuur: Site-Isolatie Protocol

Dit document definieert de professionele standaard voor het beheren van site-gegevens binnen het Athena-ecosysteem, wat zorgt voor maximale veiligheid en systeemstabiliteit.

## 🏗️ De Drie Pijlers

1.  **🏦 De Kluis (`sites/`)**: 
    - Permanente, beveiligde opslag voor alle site-repository's. 
    - **Regel**: Directe bewerking door AI-agenten is ten strengste verboden.
    - **Doel**: Het behouden van een schone "Gold Master" van elk project.

2.  **🛠️ De Werkplaats (`y/werkplaats/`)**: 
    - Een tijdelijke werkruimte voor actieve ontwikkeling en onderhoud.
    - **Regel**: Bevat alleen sites waar momenteel aan wordt gewerkt.
    - **Doel**: Een krachtige speelplek voor zowel mensen als AI.

3.  **⚙️ De Machine (`y/factory/`)**: 
    - De engine en het dashboard.
    - **Regel**: Agnostisch ten opzichte van de Kluis. Krijgt toegang tot sites via een interne `sites/` symlink naar de `werkplaats`.
    - **Doel**: Het voorkomen van scope-vervuiling tijdens geautomatiseerde fixes.

---

## 🚦 Forklift Commando's

Voer deze commando's altijd uit vanuit de `forklift/` map.

### 1. `./list.sh`
Toont welke sites in de Kluis staan en welke momenteel in de Werkplaats aanwezig zijn.
```bash
./list.sh
```

### 2. `./pull.sh <site_name>`
Haalt een site uit de Kluis naar de Werkplaats en **hydrateert** deze automatisch (voert `pnpm install` uit).
```bash
./pull.sh mijn-coole-site
```

### 3. `./push.sh <site_naam>`
Promoot wijzigingen van de Werkplaats terug naar de Kluis.
```bash
./push.sh mijn-coole-site
```

### 4. `./diff.sh <site_naam>`
Vergelijkt de werkplaats-versie met de kluis-versie.
```bash
./diff.sh mijn-coole-site
```

---

## 🛡️ AI-Veiligheidsmandaat

Elke AI-agent die binnen de `factory/` map opereert, moet zich houden aan de **Isolatie-Regel**:
> "Ik erken dat ik me in de Machine bevind. Ik zal alleen bestanden aanraken binnen `factory/` of de gekoppelde `sites/` (die naar de `werkplaats` verwijst). Ik zal nooit proberen deze grenzen te overschrijden of de beveiligde `../../sites/` kluis direct te benaderen."

Het niet naleven van deze regel resulteert in een **Beveiligingsschending** en directe beëindiging van de agent-sessie.

