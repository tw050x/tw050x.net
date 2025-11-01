import { MongoClient, type Db, type Collection } from "mongodb";
import { readdir } from "fs/promises";
import * as path from "path";
import { pathToFileURL } from "url";
import type { MigrationFile, MigrationModule } from "./types.js";

export type MigratorOptions = {
  uri: string;
  dbName: string;
  migrationsDir: string;
  collectionName?: string; // defaults to "_migrations"
};

export type MigrationDoc = {
  id: string;
  appliedAt: Date;
};

export class Migrator {
  private client!: MongoClient;
  private db!: Db;
  private collection!: Collection<MigrationDoc>;
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
    this.db = this.client.db(this.options.dbName);
    this.collection = this.db.collection<MigrationDoc>(this.options.collectionName);
    await this.collection.createIndex({ id: 1 }, { unique: true });
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
    return mod as MigrationModule;
  }

  async appliedIds(): Promise<Set<string>> {
    const docs = await this.collection.find({}, { projection: { id: 1 } }).toArray();
    return new Set(docs.map((d) => d.id));
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
      await mod.up({ client: this.client, db: this.db });
      await this.collection.insertOne({ id: f.id, appliedAt: new Date() });
      console.log(`↑ up: ${f.id}`);
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
      await mod.down({ client: this.client, db: this.db });
      await this.collection.deleteOne({ id: f.id });
      console.log(`↓ down: ${f.id}`);
    }
  }
}
