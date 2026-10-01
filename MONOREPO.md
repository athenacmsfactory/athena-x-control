# 🔱 Athena x-v9 Monorepo

> Dit is de monorepo-root. De root zelf is geen git-repo; de drie repo's
> hieronder wel. `MONOREPO.md`, `.agents/` en `skills/` worden vanuit de root
> gesynchroniseerd naar deze `athena-x-control`-repo.

Welcome to the modernized and flattened Athena x-v9 project structure.

## 📁 Directory Structure

- **`control/`**: The control plane of the monorepo.
  - `dashboard/`: The React/Vite based management interface.
  - `forklift/`: Advanced Git and file management utilities.
  - `launch.sh`: The main entry point to start the local environment.
- **`athena/`**: The core "engine" and "factory".
  - `factory/`: The Athena API and site generation engine.
  - `sites/`: **Physical directory** for all active development sites.
  - `dock/`: The internal portal and site registry management.
- **`werkplaats/`**: Root-level **symlink** to `athena/sites/` for quick access.
- **`vault/`**: Storage for parked or external site repositories.

## 🚀 Getting Started

To launch the Athena API and Dashboard, run the following command from the root directory:

```bash
./control/launch.sh
```

This will start the API on port 5000 and the Dashboard on port 5001.

## 🛠️ Management

Use the **Athena Dashboard** to:
- Manage sites in the `werkplaats` and `vault`.
- Start development servers.
- Sync metadata and registry.
- Trigger deployments.

---
*Athena v9.x Ecosystem - Flattened for Efficiency.*
