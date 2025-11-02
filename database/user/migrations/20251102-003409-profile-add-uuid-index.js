/**
 * @param {{ client: import("mongodb").MongoClient, db: import("mongodb").Db }} context
 */
export async function up({ db }) {
  await db.collection("profile").createIndex('uuid', { unique: true });
}

/**
 * @param {{ client: import("mongodb").MongoClient, db: import("mongodb").Db }} context
 */
export async function down({ db }) {
  await db.collection("profile").dropIndex('uuid_1');
}
