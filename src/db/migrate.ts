/**
 * Minimal SQL migration runner. Applies every migrations/*.sql file once,
 * in filename order, tracking applied files in `_migrations`.
 *
 * Run with: npm run db:migrate
 */
import "dotenv/config";
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import postgres from "postgres";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error("DATABASE_URL is not set (see .env.example).");

const migrationsDir = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "migrations");

async function main() {
  const sql = postgres(DATABASE_URL!, { max: 1 });
  try {
    await sql`CREATE TABLE IF NOT EXISTS _migrations (
      name text PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    )`;

    const files = readdirSync(migrationsDir)
      .filter((f) => f.endsWith(".sql"))
      .sort();

    for (const file of files) {
      const already = await sql`SELECT 1 FROM _migrations WHERE name = ${file}`;
      if (already.length > 0) {
        console.log(`• skip   ${file} (already applied)`);
        continue;
      }
      const ddl = readFileSync(join(migrationsDir, file), "utf8");
      console.log(`▶ apply  ${file}`);
      await sql.unsafe(ddl); // trusted local DDL files
      await sql`INSERT INTO _migrations (name) VALUES (${file})`;
      console.log(`✓ done   ${file}`);
    }
    console.log("Migrations complete.");
  } finally {
    await sql.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
