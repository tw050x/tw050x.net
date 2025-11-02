/**
 * @param {{ client: import("mongodb").MongoClient, db: import("mongodb").Db }} context
 */
export async function up({ db }) {
  await db.collection("nonces").createIndex('value', { unique: true });
}

/**
 * @param {{ client: import("mongodb").MongoClient, db: import("mongodb").Db }} context
 */
export async function down({ db }) {
  await db.collection("nonces").dropIndex("value_1");
}
