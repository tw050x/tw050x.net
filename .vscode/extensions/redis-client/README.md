# Redis Client for VS Code

A simple Redis client extension for VS Code.

## Features

- Connect to a Redis instance.
- View keys in a Tree View.
- Keys are grouped into subtrees by namespace segments (split on `:`) so large keyspaces stay navigable.
- Edit values.
- Delete keys.
- Filter keys via the view title "Set Filter" action (case-insensitive substring match) across key names and contents (string/hash/list/set/zset).

## Auto-refresh

The Redis tree auto-refreshes every 1 second by default, so newly added keys appear without pressing refresh. The manual "Refresh" command is still available if you want to force an immediate update.

## Build

The extension now runs directly from the JavaScript sources in `src/` (`package.json#main` points to `src/extension.js`). No TypeScript build or artifact directory is required.

## Configuration

There are no VS Code settings for this extension. Add and manage connections from the Redis view (Add/Edit/Delete actions) and credentials are stored in the extension's local storage.

Use the "Set Filter" command in the Redis view title to include only keys whose names or contents contain the given text (case-insensitive). Clear the input to remove the filter.

## Usage

1. Open the Redis view in the Activity Bar.
2. Click the "Connect" icon (plug) or run `Redis: Connect`.
3. Browse keys.
4. Click the edit icon on a key to edit its value.
5. Click the delete icon on a key to delete it.
