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
  // This banner allows us to use ESM-style __dirname/fileURLToPath in the source 
  // but compile to CJS for Electron's main process if needed.
  // However, modern Electron supports ESM. 
  // Let's stick to CJS for now but fix the import.meta.url usage by esbuild-polyfilling it.
  banner: {
    js: `
      const { fileURLToPath } = require('url');
      const { dirname } = require('path');
      const __filename = fileURLToPath('file://' + __filename);
      const __dirname = dirname(__filename);
      const importMetaUrl = 'file://' + __filename;
    `,
  },
  define: {
    'import.meta.url': 'importMetaUrl',
  },
  external: [
    "electron",
    "better-sqlite3",
    "serialport",
    "drizzle-orm",
    "drizzle-orm/better-sqlite3",
    "drizzle-orm/better-sqlite3/migrator",
  ],
}).catch(() => process.exit(1));
