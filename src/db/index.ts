/**
 * Shared database client (postgres.js + Drizzle).
 * Reuses a single connection pool across hot reloads in dev.
 */
import "server-only";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set. Copy .env.example to .env.local.");
}

const globalForDb = globalThis as unknown as {
  __careSql?: ReturnType<typeof postgres>;
};

const client =
  globalForDb.__careSql ??
  postgres(connectionString, {
    // Serverless (Vercel) spins up many short-lived instances, so keep the pool
    // small in production. `prepare: false` is required by transaction poolers
    // (Neon / Supabase pgbouncer) and is harmless on a direct connection.
    max: process.env.NODE_ENV === "production" ? 3 : 10,
    prepare: false,
  });
if (process.env.NODE_ENV !== "production") globalForDb.__careSql = client;

export const db = drizzle(client, { schema });
export { schema };
