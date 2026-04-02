const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  // Auth
  auth: {
    login: (pin) => ipcRenderer.invoke("auth:login", pin),
  },
  // Database
  db: {
    query: (query, params) => ipcRenderer.invoke("db:query", query, params),
    run: (query, params) => ipcRenderer.invoke("db:run", query, params),
  },
  // Inventory
  inventory: {
    deduct: (ingredientId, amount) => ipcRenderer.invoke("inventory:deduct", ingredientId, amount),
    checkLow: () => ipcRenderer.invoke("inventory:check-low"),
  },
  // Hardware
  printer: {
    printReceipt: (lines) => ipcRenderer.invoke("printer:print-receipt", lines),
    kickDrawer: () => ipcRenderer.invoke("printer:kick-drawer"),
    scanDevices: () => ipcRenderer.invoke("printer:scan-devices"),
  },
  // Window
  window: {
    minimize: () => ipcRenderer.send("window:minimize"),
    maximize: () => ipcRenderer.send("window:maximize"),
    close: () => ipcRenderer.send("window:close"),
  },
});
