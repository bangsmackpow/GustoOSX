import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import * as schema from "./schema/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

function getDbPath(): string {
  if (process.env.NODE_ENV === "development") {
    return join(process.cwd(), "data", "gustoosx.db");
  }
  // In production, store in ~/Library/Application Support/GustoOSX
  const home = process.env.HOME || process.env.USERPROFILE || process.cwd();
  const dbDir = join(home, "Library", "Application Support", "GustoOSX");
  return join(dbDir, "gustoosx.db");
}

export function createDb() {
  const dbPath = getDbPath();
  const sqlite = new Database(dbPath);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  return drizzle(sqlite, { schema });
}

export const db = createDb();
export { schema };
