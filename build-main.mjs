import { build } from "esbuild";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

build({
  entryPoints: [join(__dirname, "src", "main", "main.ts")],
  bundle: true,
  platform: "node",
  target: "node20",
  outfile: join(__dirname, "dist", "main.cjs"),
  format: "cjs",
  external: [
    "electron",
    "better-sqlite3",
    "serialport",
    "drizzle-orm",
    "drizzle-orm/better-sqlite3",
    "drizzle-orm/better-sqlite3/migrator",
  ],
}).catch(() => process.exit(1));
