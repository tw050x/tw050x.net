# @tw050x.net.tool/mongo-migrator

A tiny MongoDB migration CLI for the monorepo.

- Tracks applied migrations in a `_migrations` collection
- Commands: `status`, `up`, `down`, `create`
- Migration files export async `up({ db, client })` and `down({ db, client })`

## Install (workspace)

Add to root workspaces (done) and run your package manager to link.

## Usage

> TODO: The Usage section is out of date and needs to be updated

In a database package (e.g. `database/authentication`):

- Create a `migrations/` folder
- Add scripts to `package.json`:

```
{
  "scripts": {
    "migrate": "mongo-migrator --dir ./migrations",
    "migrate:status": "mongo-migrator status --dir ./migrations",
    "migrate:up": "mongo-migrator up --dir ./migrations",
    "migrate:down": "mongo-migrator down --dir ./migrations"
  }
}
```

Environment variables:
- `MONGODB_URI` (default: `mongodb://127.0.0.1:27017`)
- `MONGODB_DB` (default: `app`)

Flags:
- `--dir` path to migrations directory (default: `./migrations`)
- `--db` database name
- `--uri` connection string
- `--collection` migrations collection (default `_migrations`)
- `--limit` number to apply/rollback
- `--to` stop at/rollback to specific id

Create a migration file:

```
yarn workspace @tw050x.net.database/authentication migrate create --name "add-users-index"
```

Example template created:

```
import type { MigrationFn } from "@tw050x.net.tool/mongo-migrator";

export const up: MigrationFn = async ({ db }) => {
  await db.collection("users").createIndex({ email: 1 }, { unique: true });
};

export const down: MigrationFn = async ({ db }) => {
  await db.collection("users").dropIndex("email_1");
};
```
