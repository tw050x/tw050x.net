# Redis Client for VS Code

A simple Redis client extension for VS Code.

## Features

- Connect to a Redis instance.
- View keys in a Tree View.
- Keys are grouped into subtrees by namespace segments (split on `:`) so large keyspaces stay navigable.
- Edit values.
- Delete keys.
- Fetch keys with incremental `SCAN` calls (avoids blocking Redis) and reuse the most recent snapshot while you drill into namespaces.
- Filter keys via the view title "Set Filter" action. Plain text filters match key names. Prefix with `content:` (e.g. `content:foo`) to scan values for the term (first 200 keys per refresh, string/hash/list/set/zset types).

## Auto-refresh

The Redis tree auto-refreshes every 5 seconds when the Redis view is visible, VS Code is focused, and at least one connection is active. This keeps new keys flowing in without hammering Redis when the view is hidden or disconnected. The manual "Refresh" command is still available if you want to force an immediate update.

## Build

The extension now runs directly from the JavaScript sources in `src/` (`package.json#main` points to `src/extension.js`). No TypeScript build or artifact directory is required.

## Configuration

There are no VS Code settings for this extension. Add and manage connections from the Redis view (Add/Edit/Delete actions).

Use the "Set Filter" command in the Redis view title to restrict the snapshot:

- `foo` → case-insensitive name match.
- `content:foo` → case-insensitive match across values (string/hash/list/set/zset). Value scans are capped to the first 200 keys per refresh to keep the UI responsive.
- Clear the input to remove the filter.

## Secrets

Connection passwords are stored in VS Code's Secret Storage instead of plain JSON on disk. Existing stored passwords are migrated automatically the next time the extension loads.

## Usage

1. Open the Redis view in the Activity Bar.
2. Click the "Connect" icon (plug) or run `Redis: Connect`.
3. Browse keys.
4. Click the edit icon on a key to edit its value.
5. Click the delete icon on a key to delete it.
