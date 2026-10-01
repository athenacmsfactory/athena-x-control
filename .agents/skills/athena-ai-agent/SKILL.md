---
name: athena-ai-agent
description: Bevat scripts en MCP tools gebruikt om Athena te koppelen aan AI workflows, prompts te genereren en waterfalschema's te runnen.
---

# Athena AI Agent Skill

Deze skill indexeert AI-specifieke engine onderdelen in `/home/kareltestspecial/1-IT/4-pj/x-v9/athena/factory/5-engine`. 

## AI Implementaties
- **`athena-agent.js`**: Vermoedelijk een standalone runner script voor een agentsessie of het automatiseren van een task-loop.
- **`athena-mcp-helper.js`** / **`athena-mcp-runner.js`**: Integraties met het Model Context Protocol, om AI via externe pipelines (ex. Claude/Jules/Mezelf) functies uit te laten voeren.
- **`sync-ai-waterfall.js`**: Bestuurt asynchrone ketens van AI verzoeken om complexe taken te delegeren.

## Prompt Generatie
- **`generate-prompts.js`**
- **`generate-image-prompts.js`**

**Richtlijn voor de AI:**
Bij het debuggen van de "gedachtegang" of Model-aansturingen binnen de codebase, bekijk dan `athena-agent.js` en de MCP implementaties om te begrijpen hoe context aan modellen wordt overgedragen.
