# Agent Instructions: GustoOSX Context

## ⚠️ Critical Build Notes

### 1. Node-Gyp & Python 3.12
The GitHub Actions runner uses Python 3.12, which removed `distutils`. Older versions of `better-sqlite3` and `serialport` may fail to build. 
- **Requirement:** `package.json` contains a `pnpm.overrides` for `node-gyp: ^10.2.0`. **Do not remove this.**

### 2. ESBuild & Import Paths
The main process is built via `build-main.mjs`. 
- **Rule:** Do not use `.js` or `.ts` extensions in imports within `src/main` or `src/db`. ESBuild is configured to resolve these automatically. 
- **Rule:** The `import.meta.url` is polyfilled in `build-main.mjs` using a banner to ensure `__dirname` works in the compiled CommonJS output.

### 3. Database Pattern
- **ORM:** Drizzle ORM.
- **Client:** `better-sqlite3`.
- **Sync:** All DB operations go through `window.api.db.query` (returns data) or `window.api.db.run` (executes changes). These are handled in `src/main/main.ts`.

## 🎨 UI Standards
- **Style:** Tailwind CSS 4.0.
- **Icons:** Lucide-React.
- **Animations:** Framer Motion (use for modals and list transitions).
- **Theme:** Strict Dark Mode (`bg-pos-bg: #0a0a0a`).

## 🔧 Hardware Logic
- **Printer:** ESC/POS via `serialport`. Commands are sent as raw Buffers.
- **Scanner:** HID Keyboard mode. Listening is implemented in `App.tsx` via a global `keydown` event listener.
