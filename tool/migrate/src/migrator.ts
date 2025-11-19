import { MongoClient } from "mongodb";
import { readdir } from "fs/promises";
import * as path from "path";
import { pathToFileURL } from "url";
import type { MigrationFile, MigrationModule } from "./types.js";

export type MigratorOptions = {
  uri: string;
  migrationsDir: string;
  collectionName?: string; // defaults to "_migrations"
};

export type MigrationDoc = {
  id: string;
  appliedAt: Date;
};

export class Migrator {
  private client!: MongoClient;
  private readonly options: Required<MigratorOptions>;

  constructor(opts: MigratorOptions) {
    this.options = {
      collectionName: "_migrations",
      ...opts,
    } as Required<MigratorOptions>;
  }

  async connect() {
    this.client = new MongoClient(this.options.uri);
    await this.client.connect();
  }

  async close() {
    if (this.client) await this.client.close();
  }

  async listMigrationFiles(): Promise<MigrationFile[]> {
    const files: string[] = await readdir(this.options.migrationsDir).catch(() => [] as string[]);
    const jsFiles: string[] = files.filter((f: string) => f.endsWith(".js"));
    const sorted: string[] = jsFiles.sort();
    return sorted.map((filename: string) => ({
      id: filename.replace(/\.js$/i, ""),
      filename,
      fullPath: path.join(this.options.migrationsDir, filename),
    }));
  }

  async loadModule(fullPath: string): Promise<MigrationModule> {
    const mod = await import(pathToFileURL(fullPath).href);
    if (!("up" in mod) || !("down" in mod)) {
      throw new Error(`Migration must export 'up' and 'down': ${fullPath}`);
    }
    if (!("database" in mod)) {
      throw new Error(`Migration must export 'database': ${fullPath}`);
    }
    return mod as MigrationModule;
  }

  async appliedIds(): Promise<Set<string>> {
    const files = await this.listMigrationFiles();
    const allAppliedIds = new Set<string>();

    // Check each migration's target database for applied migrations
    for (const file of files) {
      const mod = await this.loadModule(file.fullPath);
      const db = this.client.db(mod.database!);
      const collection = db.collection<MigrationDoc>(this.options.collectionName);

      const doc = await collection.findOne({ id: file.id });
      if (doc) {
        allAppliedIds.add(file.id);
      }
    }

    return allAppliedIds;
  }

  async status() {
    const files = await this.listMigrationFiles();
    const applied = await this.appliedIds();
    const appliedList = files.filter((f) => applied.has(f.id)).map((f) => f.id);
    const pendingList = files.filter((f) => !applied.has(f.id)).map((f) => f.id);
    return { applied: appliedList, pending: pendingList };
  }

  async up(limit?: number, toId?: string) {
    const files = await this.listMigrationFiles();
    const appliedFileIDs = await this.appliedIds();
    const pendingFiles = files.filter((f) => !appliedFileIDs.has(f.id));

    const runList: MigrationFile[] = [];
    for (const f of pendingFiles) {
      runList.push(f);
      if (toId && f.id === toId) break;
      if (!toId && limit && runList.length >= limit) break;
    }

    for (const f of runList) {
      const mod = await this.loadModule(f.fullPath);
      const targetDb = this.client.db(mod.database!);
      await mod.up({ client: this.client, db: targetDb });

      const collection = targetDb.collection<MigrationDoc>(this.options.collectionName);
      await collection.createIndex({ id: 1 }, { unique: true });
      await collection.insertOne({ id: f.id, appliedAt: new Date() });
      console.log(`↑ up: ${f.id} (database: ${mod.database})`);
    }
  }

  async down(limit = 1, toId?: string) {
    const files = await this.listMigrationFiles();
    const applied = await this.appliedIds();

    const appliedFiles = files.filter((f) => applied.has(f.id)).reverse(); // newest first
    const runList: MigrationFile[] = [];
    for (const f of appliedFiles) {
      runList.push(f);
      if (toId && f.id === toId) break;
      if (!toId && runList.length >= limit) break;
    }

    for (const f of runList) {
      const mod = await this.loadModule(f.fullPath);
      const targetDb = this.client.db(mod.database!);
      await mod.down({ client: this.client, db: targetDb });

      const collection = targetDb.collection<MigrationDoc>(this.options.collectionName);
      await collection.deleteOne({ id: f.id });
      console.log(`↓ down: ${f.id} (database: ${mod.database})`);
    }
  }
}
