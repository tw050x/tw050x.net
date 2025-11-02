import type { Db, MongoClient } from "mongodb";

export type MigrationFn = (ctx: { client: MongoClient; db: Db }) => Promise<void>;

export type MigrationModule = {
  database: string; // required database name export
  up: MigrationFn;
  down: MigrationFn;
};

export type MigrationFile = {
  id: string;        // e.g. 20251019-120000-add-users-index
  filename: string;  // filename with extension
  fullPath: string;  // absolute path
};
