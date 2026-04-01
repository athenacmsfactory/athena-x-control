# 🔱 Athena x-v9 Control Plane

This repository contains the management interface and utilities for the Athena x-v9 ecosystem.

## 📁 Components

- **`dashboard/`**: A React/Vite based management interface for monitoring sites, handling deployments, and configuring the engine.
- **`forklift/`**: A set of robust bash utilities for synchronizing site data between the active `athena/sites` (werkplaats) and the `vault` (archive).
- **`launch.sh`**: The main entry point to start the local Athena atmosphere.

## 🚀 Usage

To start the Athena API and the Dashboard UI, run the following command from this directory:

```bash
./launch.sh
```

### 🛰️ Ports
- **API**: 5000
- **Dashboard**: 5001

## 🛠️ Management Utilities (Forklift)

The `forklift/` directory contains scripts for site promotion and archival:

- `pull.sh <site>`: Pulls a site from the `vault` into the active `athena/sites` and performs hydration (`pnpm install`).
- `push.sh <site>`: Pushes (promotes) a site from the active workspace back to the `vault`.
- `list.sh`: Lists available sites in both the workspace and the vault.

---
*Athena v9.x Control Plane - Centralized Management.*
