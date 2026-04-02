# GustoOSX

Slim, macOS-only Bar POS — local-first, offline-ready.

Built for older Macs running macOS Monterey (12.0+) and up. No cloud, no Docker, no setup. Just install and pour.

## Features

- **PIN-based login** — instant staff auth, zero DB overhead
- **Tab management** — open tabs by name or table number
- **Menu grid** — touch-friendly, category-filtered drink menu
- **Quick search** — ⌘K to find any drink instantly
- **Real-time inventory** — auto-deducts spirits/mixers per recipe
- **Hardware support** — ESC/POS thermal printer, cash drawer (DK port), USB barcode scanner
- **Dark mode** — optimized for dimly lit bars
- **Offline-first** — SQLite local database, no internet required

## Quick Start

```bash
# Install dependencies
pnpm install

# Seed the database
pnpm db:seed

# Run dev mode (Electron + Vite HMR)
pnpm dev

# Build for production
pnpm build
pnpm build:main

# Package as .dmg
pnpm package
```

## Default Users

| Role | PIN |
|------|-----|
| Admin | 1234 |
| Bartender | 0000 |

## Project Structure

```
GustoOSX/
├── src/
│   ├── main/              # Electron main process
│   │   ├── main.ts        # App entry, IPC handlers
│   │   ├── preload.cjs    # Context bridge
│   │   └── services/
│   │       └── hardware.ts # ESC/POS printer & cash drawer
│   ├── renderer/          # React UI
│   │   ├── index.html
│   │   └── src/
│   │       ├── App.tsx
│   │       ├── store.ts   # Zustand state
│   │       ├── components/
│   │       │   ├── LoginScreen.tsx
│   │       │   ├── POSLayout.tsx
│   │       │   ├── MenuGrid.tsx
│   │       │   ├── OrderPanel.tsx
│   │       │   ├── TabBar.tsx
│   │       │   ├── QuickSearch.tsx
│   │       │   └── WindowControls.tsx
│   └── db/
│       ├── index.ts       # Drizzle + better-sqlite3
│       ├── schema/
│       │   └── index.ts   # All table definitions
│       ├── migrate.ts
│       └── seed.ts        # Starter menu data
├── drizzle.config.ts
├── electron-builder.yml
├── vite.config.ts
└── build-main.mjs
```

## Database

SQLite via `better-sqlite3` with Drizzle ORM. Data stored at:
- **Dev:** `./data/gustoosx.db`
- **Production:** `~/Library/Application Support/GustoOSX/gustoosx.db`

### Tables

- `users` — Staff with PIN auth and roles
- `drinks` — Menu items with categories and pricing
- `ingredients` — Stock-tracked spirits, beers, mixers
- `recipe_ingredients` — Drink-to-ingredient mappings (ml-based)
- `tabs` — Open/closed tabs
- `orders` — Line items on tabs
- `shifts` — Shift tracking for Z-reports
- `settings` — Bar config, printer settings

## Hardware

### Thermal Printer (ESC/POS)
Connect via USB. The app scans for available serial devices and sends raw ESC/POS commands for receipt printing and cash drawer kicks.

### Cash Drawer
Triggered through the printer's DK port using standard ESC/POS pulse commands.

### Barcode Scanner
Works as a standard HID keyboard input — no special driver needed. Scanning a barcode types the SKU into the focused search field.

## License

MIT
