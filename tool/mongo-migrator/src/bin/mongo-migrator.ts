#!/usr/bin/env node
import { mkdir, writeFile } from "fs/promises";
import { join, resolve, isAbsolute } from "path";
import { Migrator } from "../migrator.js";
import { migrationTemplate } from "../templates/migration.template.js";

// Usage:
//   mongo-migrator up [--limit=1] [--to=migration-id]
//   mongo-migrator down [--limit=1] [--to=migration-id]
//   mongo-migrator status
//   mongo-migrator create --name="description" [--dir=...] [--db=...] [--uri=...] [--collection=_migrations]

const args = process.argv.slice(2);

const command = args[0];

function readFlag(name: string) {
  const prefix = `--${name}=`;
  const found = args.find((a: string) => a.startsWith(prefix));
  return found ? found.substring(prefix.length) : undefined;
}

function readIntFlag(name: string) {
  const v = readFlag(name);
  return v ? parseInt(v, 10) : undefined;
}

function getInvocationCwd(): string {
  return process.env.INIT_CWD || process.env.PROJECT_CWD || process.cwd();
}

async function main() {

  if (!command || ["up", "down", "status", "create"].includes(command) === false) {
    console.log("Usage:");
    console.log("  mongo-migrator up [--limit=1] [--to=migration-id]");
    console.log("  mongo-migrator down [--limit=1] [--to=migration-id]");
    console.log("  mongo-migrator status");
    console.log("  mongo-migrator create --name='add-users-index'");
    process.exit(1);
  }

  const uri = readFlag("uri") ?? process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017";
  const dbName = readFlag("db") ?? process.env.MONGODB_DB ?? "app";
  const baseCwd = getInvocationCwd();
  const dirFlag = readFlag("dir");
  const migrationsDir = dirFlag
    ? (isAbsolute(dirFlag) ? dirFlag : resolve(baseCwd, dirFlag))
    : resolve(baseCwd, "migrations");
  const collectionName = readFlag("collection") ?? "_migrations";

  if (command === "create") {
    const name = readFlag("name");
    if (!name) {
      console.error("--name is required for create");
      process.exit(1);
    }
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, "0");
    const id = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}-${slug}`;
    const filename = `${id}.ts`;
    const fullPath = join(migrationsDir, filename);

    await mkdir(migrationsDir, { recursive: true });
    await writeFile(fullPath, migrationTemplate);
    return void console.log(`Created: ${fullPath}`);
  }

  const migrator = new Migrator({ uri, dbName, migrationsDir, collectionName });
  await migrator.connect();

  try {
    switch (command) {
      case "status": {
        const s = await migrator.status();
        console.log("Applied:");
        s.applied.forEach((id: string) => console.log(`  ✔ ${id}`));
        console.log("Pending:");
        s.pending.forEach((id: string) => console.log(`  • ${id}`));
        break;
      }
      case "up": {
        const limit = readIntFlag("limit");
        const to = readFlag("to");
        await migrator.up(limit, to);
        break;
      }
      case "down": {
        const limit = readIntFlag("limit") ?? 1;
        const to = readFlag("to");
        await migrator.down(limit, to);
        break;
      }
      default:
        // no-op, unreachable due to earlier guard
        break;
    }
  } finally {
    await migrator.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
