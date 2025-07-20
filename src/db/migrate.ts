import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import logger from "../utils/logger_simple";

export async function runMigrations() {
  const pool = new Pool({
    connectionString:
      process.env.DATABASE_URL ||
      "postgresql://postgres:test123@localhost:5432/mydb",
  });

  const db = drizzle(pool);

  try {
    logger.info("Starting database migrations...");
    await migrate(db, { migrationsFolder: "./drizzle/migrations" });
    logger.info("Database migrations completed successfully");
  } catch (error) {
    logger.error("Migration failed", {
      error: error instanceof Error ? error.message : error,
    });
    throw error;
  } finally {
    await pool.end();
  }
}
