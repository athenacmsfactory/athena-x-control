# Forklift Management Scripts

Forklift is a set of scripts for managing site data between the **Vault** and the **Playground**.

## Directory Structure

- **Vault**: `/home/kareltestspecial/0-IT/3-DEV/y1/sites/` (Source of truth)
- **Playground**: `/home/kareltestspecial/0-IT/3-DEV/y1/y/werkplaats/` (Development area)

## Commands

### 1. Pull
Syncs data from the Vault to the Playground and **automatically hydrates** the site (runs `pnpm install`).

```bash
./pull.sh <site_name>
```

### 2. Push
Syncs data from the Playground to the Vault. This 'promotes' changes.

```bash
./push.sh <site_name>
```
*Note: This command will append or overwrite files in the Vault with the Playground version. Files in the Vault that are NOT in the Playground will NOT be deleted. Manual deletion is required if you want to remove files from the Vault.*

### 3. Diff
Shows the differences between the Playground version and the Vault version of a site.

```bash
./diff.sh <site_name>
```

## Implementation Details

- **Security**: All scripts validate the `<site_name>` to prevent path traversal (no slashes or dots allowed).
- **No Deletion Rule**: Forklift will never delete files from the destination. It only appends or overwrites. Manual deletion is required for cleanup.
- **Efficiency**: Uses `rsync` for efficient syncing.
- **Exclusions**: Automatically excludes `node_modules` and `.git` directories.
- **Stability**: Uses absolute paths for all operations.
