// Specify the database this migration should run against
export const database = "users";

/**
 * @param context
 */
export async function up({ db }) {
  await db.collection("nonces").createIndex('value', { unique: true });
}

/**
 * @param context
 */
export async function down({ db }) {
  await db.collection("nonces").dropIndex("value_1");
}
