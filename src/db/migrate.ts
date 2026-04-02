import { createDb } from "./index.js";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const db = createDb();
const migrationsPath = join(process.cwd(), "drizzle", "migrations");

console.log("Running migrations...");
migrate(db, { migrationsFolder: migrationsPath });
console.log("Migrations complete.");
