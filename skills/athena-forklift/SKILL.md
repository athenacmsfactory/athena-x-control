# Athena Forklift Skill

Deze skill bevat de strikte procedure voor het verplaatsen van sites van de Factory (**Werkplaats**) naar de permanente **Vault** en de bijbehorende Git-operaties.

## De "Scratchpad" Filosofie

De Factory (`athena/`) fungeert als je actieve **kladblok**. Sites in de `sites/` map zijn onderdeel van je actieve werkvenster.

### 1. In de Factory (Het Kladblok)
*   **Versiebeheer**: Gebruik de Factory-repo om al je "kladwerk" (WIP) lokaal bij te houden via commits. Dit is je vangnet tijdens het bouwen.
*   **Geen Remote Push**: De Factory-remote (GitHub) is alleen voor de framework-architectuur. Poushen gebeurt pas nadat de Werkplaats is opgeschoond, of als er wijzigingen aan de "machine" zelf zijn.
*   **Tijdelijkheid**: Sites mogen in de Factory blijven staan, ook nadat ze naar de Vault zijn verplaatst, zolang je er nog aan wilt "kladderen".

### 2. Promotie naar de Vault (Het Product)
*   Wanneer een site-versie stabiel is, gebruik je de Forklift om deze naar de **Vault** te tillen.
*   De Vault is de enige plek vanwaaruit de productie-code naar de officiële site-repositories wordt gepusht.

### 3. Opschonen (Optioneel)
*   Het **purgen** (verwijderen) van een site uit de Factory is een keuze. Je doet dit wanneer het kladwerk niet langer nuttig is en je de Factory-venster "schoon" wilt maken voor een nieuw project.

## De Procedure

### Stap 1: Promotie naar de Vault
```bash
# Zonder purge: behoudt het kladwerk in de Factory
bash /home/kareltestspecial/workspace/x-v9/control/forklift/push.sh <site-name> --yes

# Met purge: verwijdert het kladwerk en commit de verwijdering
bash /home/kareltestspecial/workspace/x-v9/control/forklift/push.sh <site-name> --yes --purge
```

### Stap 2: Vault Publicatie
```bash
cd /home/kareltestspecial/workspace/x-v9/vault/
git add .
git commit -m "feat(<site-name>): <omschrijving>"
git push origin main
```

## Belangrijke Regels
1.  **Vault = Waarheid**: Alleen de Vault bevat de officiële, te publiceren staat van een site.
2.  **Factory = Kladblok**: Gebruik lokale commits in de Factory voor al je experimenten en WIP.
