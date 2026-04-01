# Walkthrough: Project-Isolatie & Forklift Systeem 🚜

Ik heb de projectstructuur succesvol gereorganiseerd om maximale veiligheid te garanderen tegen onbedoelde schade door AI-agenten. De "Kluis" (permanente sites) is nu geïsoleerd van de "Machine" (engine).

## 🏢 Bijgewerkte Structuur

De projectroot `~/0-IT/3-DEV/y1/` bevat nu:
- **`sites/`**: Je beveiligde kluis met site-repository's.
- **`y/werkplaats/`**: De tijdelijke werkomgeving voor onderhoud.
- **`y/factory/`**: De factory engine (kijkt nu naar `werkplaats` voor sites).
- **`forklift/`**: De beheer-scripts.

## 🚦 Hoe de Forklift te gebruiken

Het beheren van sites is nu een simpel proces van 3 stappen:

### 1. Identificeer je Site
Bekijk welke sites in de Kluis staan en wat er momenteel in de Werkplaats aanwezig is.
```bash
cd ~/0-IT/3-DEV/y1/forklift
./list.sh
```

### 2. Pull voor Onderhoud
Breng een site naar de Werkplaats zodat de factory deze kan "zien" en "bewerken".
```bash
./pull.sh <site_naam>
```

### 3. Promoot je Wijzigingen
Nadat je klaar bent met je werk in de Factory/Dashboard, synchroniseer je de wijzigingen terug naar de Kluis.
```bash
./push.sh <site_naam>
```

## 🛡️ AI-Veiligheid Gegarandeerd
De interne `sites/` map van de Factory is nu een symlink naar `../../werkplaats`. Dit zorgt ervoor dat zelfs als een AI-agent probeert alles tegelijk te "fixen", hij **alleen** die sites kan aanraken die JIJ expliciet naar de Werkplaats hebt gehaald.

Het `GEMINI.md` bestand is bijgewerkt met een strikt **PROJECT ISOLATION MANDATE** om geautomatiseerde taken binnen deze veilige grenzen te houden.

---
**Status**: Architectuur Voltooid & Geverifieerd.
🎉 Klaar voor veilig bouwen! 🚜
