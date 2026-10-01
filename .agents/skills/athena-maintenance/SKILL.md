---
name: athena-maintenance
description: Index van systeem- en onderhoudsscripts voor schijfbeheer, log-rotatie en back-ups van Athena sites.
---

# Athena Maintenance Skill

Deze skill verwijst naar systeem- en onderhoudsscripts gelegen in `/home/kareltestspecial/1-IT/4-pj/x-v9/athena/factory/6-utilities`.

**BELANGRIJK:** Verplaats deze scripts niet, ze zijn vaak onderdeel van dagelijkse backend beheer-taken.

## Kernscripts

- **`bulk-site-audit.js`**: Voert controles uit op de integriteit van websites (of ze correct gebouwd zijn).
- **`storage-audit-deep.js`**: Extreem belangrijk op de Chromebook: controleert waar eventueel onnodig grote mappen/bestanden zitten.
- **`storage-prune.js`**: Formeel opruimscript voor ruimtebesparing.
- **`rotate-logs.js`**: Voor beheer van loggroottes van services.
- **`nightly-maintenance.js`**: Batch-operaties ('s nachts).
- **`backup-org.sh`**: Shell script dat back-ups verzorgt.
- **`freeze-site.cjs`**: Wordt waarschijnlijk gebruikt om een site inactief te maken, maar te bewaren in een 'frozen' / bevroren staat.
- **`park-site.sh`**: Om een site "te parkeren" / archiveren.
- **`retrieve-site.sh`**: Een site ophalen om er weer aan te werken.

## Context voor opslag en onderhoud

- Gezien de Chromebook hardware belemmeringen, adviseer vaak om `storage-prune.js` aan te reiken of Node's `pnpm store prune` te overwegen wanneer opslag een issue wordt, cf. de user rule `.bash_aliases / Proactief Opslagbeheer`.
