# @tw050x.net.tool/migrate

A database migration CLI tool for the monorepo.

- Tracks applied migrations in a `_migrations` collection
- Commands: `status`, `up`, `down`, `create`
- Migration files export async `up({ db, client })` and `down({ db, client })`

## Install (workspace)

Add to root workspaces (done) and run your package manager to link.

## Usage

- Create a `migrations/` folder
- Add scripts to `package.json`:

```
{
  "scripts": {
    "mongo:migrate": "migrate --dir ./migrations",
    "mongo:migrate:status": "migrate status --dir ./migrations",
    "mongo:migrate:up": "migrate up --dir ./migrations",
    "mongo:migrate:down": "migrate down --dir ./migrations"
  }
}
```

Environment variables:
- `MONGODB_USERNAME`
- `MONGODB_PASSWORD`
- `MONGODB_HOST` (default: `127.0.0.1:27017`)

Or

- `MONGODB_URI` (default: `mongodb://<username>:<password>@<host>`)

Flags:
- `--dir` path to migrations directory (default: `./migrations`)
- `--uri` connection string
- `--collection` migrations collection (default `_migrations`)
- `--limit` number to apply/rollback
- `--to` stop at/rollback to specific id

Create a migration file:

```bash
yarn migrate create --name "add-users-index"
```

Example template created:

```javascript
export const database = "app";

export const up = async ({ db }) => {
  await db.collection("users").createIndex({ email: 1 }, { unique: true });
};

export const down = async ({ db }) => {
  await db.collection("users").dropIndex("email_1");
};
```
