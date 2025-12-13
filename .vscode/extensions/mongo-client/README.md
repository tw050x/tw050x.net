# Mongo Client for VS Code

A simple MongoDB client extension for VS Code (local workspace extension).

## Features

- Add/Edit/Delete connections (stored in VS Code global storage).
- Connect to a MongoDB instance.
- Browse databases, collections, and documents via a Tree View.
- Open a document in an editor tab and edit it as Extended JSON.
- View basic metadata for collections and documents.

## Notes

- Documents are shown using MongoDB Extended JSON (via `bson`/`EJSON`) so types like `ObjectId` and `Date` round-trip safely.
- Editing preserves the original `_id` (changing `_id` is rejected).

## Dev

Install deps:

- Run `extension: mongo-client install dependencies` (see root `.vscode/tasks.json`), or `yarn install` in `.vscode/extensions/mongo-client`.
