# Project Status: GustoOSX (v0.1.7)

## ✅ Completed Features

### 1. Tab & Table Management
- [x] Open tab by name/table.
- [x] Tab renaming and metadata updates.
- [x] **Split Check:** Move specific items to a new tab.
- [x] **Keep Card:** Visual tracking for held credit cards.
- [x] Table number integration.

### 2. Inventory & Recipe Logic
- [x] Ingredient tracking (ml and units).
- [x] Recipe-based deduction on checkout.
- [x] **Low Stock Alerts:** Visual badges on menu and inventory view.
- [x] **Inventory Audit View:** Bulk restock and waste logging UI.

### 4. Staff & Operational Security
- [x] PIN-based login system.
- [x] Role-based permissions (Admin/Manager/Bartender).
- [x] **Manager Overrides:** PIN prompt for voids and sensitive actions.
- [x] **Shift Audit:** Reports filtered by staff member.

### 5. Localization & Customer Experience
- [x] **Bilingual Support:** `name_es` support in DB and UI.
- [x] **Bilingual Receipts:** Prints in English or Spanish based on system setting.
- [x] ESC/POS hardware service for thermal printing.

## ⏳ Pending / Next Steps

### Category 3: Dynamic Pricing
- [ ] Scheduled Happy Hour price adjustments.
- [ ] Automated upcharges for premium mixers/doubles.

### Category 1 Extension: Table Mapping
- [ ] Visual floor plan/grid for table selection.

### Category 5 Extension: Branding
- [ ] Settings UI for custom bar logo (bitmap) and receipt headers.

## 🛠️ Build Stability
- **GitHub Actions:** Passing (v0.1.7). Fixed Python 3.12 `distutils` error by overriding `node-gyp` to v10.2.0.
- **Architecture:** Universal macOS (x64/arm64) support verified.
