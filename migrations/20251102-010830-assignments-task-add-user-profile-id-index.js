// Specify the database this migration should run against
export const database = "assignments";

/**
 * @param context
 */
export async function up({ db }) {
  await db.collection("tasks").createIndex('userProfileId');
}

/**
 * @param context
 */
export async function down({ db }) {
  await db.collection("tasks").dropIndex('userProfileId_1');
}
