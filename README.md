# GustoOSX

Slim, macOS-only Bar POS — local-first, offline-ready. Optimized for macOS Monterey (12.0+).

## 🚀 Core Features

- **Staff Security** — PIN-based login with roles (Admin, Manager, Bartender). Manager-only overrides for voids and cash drawer kicks.
- **Advanced Tab Management** — Open tabs by name or table. Rename, transfer, or split checks between customers.
- **"Keep Card" Tracking** — Visual indicator for physical credit cards held behind the bar.
- **Bilingual Support** — Full English and Spanish support for menu items and thermal receipts.
- **Inventory Audit** — Real-time deduction based on recipes. Bulk restock UI and waste logging with low-stock visual alerts.
- **Z-Reports & Audits** — Detailed shift breakdowns by staff performance, payment method (Cash/Card), and item sales.
- **Hardware Layer** — Native support for ESC/POS USB printers, DK-port cash drawers, and HID barcode scanners.

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS, Framer Motion.
- **State:** Zustand (Store-per-view architecture).
- **Backend:** Electron 33 (CommonJS Main Process).
- **Database:** SQLite via `better-sqlite3` and Drizzle ORM.
- **Build:** ESBuild (Main) and Vite (Renderer).

## 📦 Build & Development

```bash
# Install dependencies (requires Node 20+)
pnpm install

# Database Setup
pnpm db:generate  # Generate migrations
pnpm db:migrate   # Apply to local SQLite
pnpm db:seed      # Load default menu & staff

# Run Development
pnpm dev

# Production Build
pnpm build        # Build Renderer
pnpm build:main   # Build Main Process (ESBuild with CJS polyfills)
pnpm package      # Create .dmg (Universal/x64)
```

## 🏗️ Project Structure

- `src/main` — Electron main process and hardware services.
- `src/renderer` — React application and components.
- `src/db` — Drizzle schema, migrations, and seed data.
- `.github/workflows` — Optimized CI/CD with pnpm caching and node-gyp fixes.

## 📜 License
MIT
