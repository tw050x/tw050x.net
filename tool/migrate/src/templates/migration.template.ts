// Export the migration file template as a string.
// Using a tiny dedent helper keeps the indentation readable in source
// while emitting a clean string at runtime.

function dedent(strings: TemplateStringsArray, ...values: unknown[]): string {
  const raw = strings.raw.reduce((acc, str, i) => acc + str + (i < values.length ? String(values[i]) : ""), "");
  const lines = raw.replace(/^\n/, "").split(/\n/);
  const indents = lines
    .filter((l) => l.trim().length)
    .map((l) => l.match(/^\s*/)?.[0].length ?? 0);
  const min = indents.length ? Math.min(...indents) : 0;
  const out = lines.map((l) => (l.length ? l.slice(min) : l)).join("\n");
  return out.endsWith("\n") ? out : out + "\n";
}

export const migrationTemplate = dedent`
  // Specify the database this migration should run against
  export const database = "app";

  /**
   * @param {{ client: import("mongodb").MongoClient, db: import("mongodb").Db }} context
   */
  export async function up({ db }) {
    // Add changes here, e.g.:
    // await db.collection("users").createIndex({ email: 1 }, { unique: true });
  }

  /**
   * @param {{ client: import("mongodb").MongoClient, db: import("mongodb").Db }} context
   */
  export async function down({ db }) {
    // Revert changes here, e.g.:
    // await db.collection("users").dropIndex("email_1");
  }
`;
