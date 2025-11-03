// Specify the database this migration should run against
export const database = "users";

/**
 * @param context
 */
export async function up({ db }) {
  await db.collection('profiles').createIndex(
    { phone: 1 },
    {
      unique: true,
      partialFilterExpression: {
        phone: { $type: "string" }
      }
    }
  );
}

/**
 * @param context
 */
export async function down({ db }) {
  await db.collection('profiles').dropIndex('phone_1');
}
