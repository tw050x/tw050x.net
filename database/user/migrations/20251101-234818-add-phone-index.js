/**
 * @param {{ client: import("mongodb").MongoClient, db: import("mongodb").Db }} context
 */
export async function up({ db }) {
  await db.collection('profile').createIndex('phone', { unique: true });
}

/**
 * @param {{ client: import("mongodb").MongoClient, db: import("mongodb").Db }} context
 */
export async function down({ db }) {
  await db.collection('profile').dropIndex('phone_1');
}
