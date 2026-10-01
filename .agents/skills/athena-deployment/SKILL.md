---
name: athena-deployment
description: De componenten voor het flushen, testen, clonen en pushen van sites of monorepos naar Github en productie.
---

# Athena Deployment Skill

Deze skill indexeert de releasemechanismen binnen `/home/kareltestspecial/1-IT/4-pj/x-v9/athena/factory/5-engine`.

## Github & Opslag Repositories
Scripts verantwoordelijk voor Git-connectiviteit en versionering van de output.
- **`create-repo.js`**
- **`sync-monorepo-to-github.js`**
- **`push-sites.sh`**

## Release en Quality Assurance (QA)
- **`deploy-prototype.js`**: Pushed een staging model of prototype.
- **`site-tester.js`**: Checkt voor build/deploy errors vóór de definitieve commit.
- **`status-check.js`** / **`sync-deployment-status.js`**: Monitor tools op live/pushed statussen.
- **`rebuild-site.js`**: Geforceerde rebuild.

**Richtlijn voor de AI:**
Voordat bestanden of sites defitinief gepusht worden in een CI/CD-achtige workflow, roept Athena via het dashboard of via CLI vaak deze scripts aan. Gebruik de standaard SSH & Git Protocols (uit the USER rules) indien je deze scripts bewerkt die met `gh` of `git` interacteren.
