/**
 * @param {{ client: import("mongodb").MongoClient, db: import("mongodb").Db }} context
 */
export async function up({ db }) {
  await db.collection("task").createIndex('userProfileId');
}

/**
 * @param {{ client: import("mongodb").MongoClient, db: import("mongodb").Db }} context
 */
export async function down({ db }) {
  await db.collection("task").dropIndex('userProfileId_1');
}
