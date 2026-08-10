import "dotenv/config";
import { defineConfig } from "drizzle-kit";

/**
 * Drizzle Kit is used for schema introspection / studio. The authoritative DDL
 * (PostGIS, triggers, full-text) lives in migrations/*.sql applied via
 * `npm run db:migrate`. Use `npm run db:studio` to browse data.
 */
export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgres://care:care@localhost:5432/india_care_setu",
  },
});
