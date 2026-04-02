import { app, BrowserWindow, ipcMain, dialog } from "electron";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { createDb } from "./db/index.js";
import { hardwareService } from "./services/hardware.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

let mainWindow: BrowserWindow | null = null;
const isDev = process.env.NODE_ENV === "development";

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 768,
    titleBarStyle: "hiddenInset",
    backgroundColor: "#0a0a0a",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: join(__dirname, "preload.cjs"),
    },
  });

  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools({ mode: "detach" });
  } else {
    mainWindow.loadFile(join(__dirname, "public", "index.html"));
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  // Initialize database
  const db = createDb();

  // IPC handlers
  ipcMain.handle("db:query", async (_event, query: string, params: unknown[]) => {
    try {
      return { success: true, data: db.query(query, params) };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle("db:run", async (_event, query: string, params: unknown[]) => {
    try {
      db.run(query, params);
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle("auth:login", async (_event, pin: string) => {
    try {
      const result = db.query(`SELECT * FROM users WHERE pin = ? AND is_active = 1`, [pin]);
      if (result.length > 0) {
        return { success: true, user: result[0] };
      }
      return { success: false, error: "Invalid PIN" };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle("inventory:deduct", async (_event, ingredientId: string, amount: number) => {
    try {
      db.run(`UPDATE ingredients SET current_stock = current_stock - ?, updated_at = unixepoch() WHERE id = ?`, [amount, ingredientId]);
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle("inventory:check-low", async () => {
    try {
      const result = db.query(`SELECT * FROM ingredients WHERE current_stock <= minimum_stock`);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // Hardware IPC
  ipcMain.handle("printer:print-receipt", async (_event, lines: string[]) => {
    return hardwareService.printReceipt(lines);
  });

  ipcMain.handle("printer:kick-drawer", async () => {
    return hardwareService.kickDrawer();
  });

  ipcMain.handle("printer:scan-devices", async () => {
    return hardwareService.scanPrinterDevices();
  });

  // Window controls
  ipcMain.on("window:minimize", () => mainWindow?.minimize());
  ipcMain.on("window:maximize", () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow?.maximize();
    }
  });
  ipcMain.on("window:close", () => mainWindow?.close());

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// Hardware cleanup
app.on("will-quit", () => {
  hardwareService.cleanup();
});
