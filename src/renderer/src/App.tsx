import { useState, useEffect, useCallback } from "react";
import { useStore } from "./store";
import { LoginScreen } from "./components/LoginScreen";
import { POSLayout } from "./components/POSLayout";

declare global {
  interface Window {
    api: {
      auth: { login: (pin: string) => Promise<{ success: boolean; user?: any; error?: string }> };
      db: {
        query: (q: string, p: unknown[]) => Promise<{ success: boolean; data?: any; error?: string }>;
        run: (q: string, p: unknown[]) => Promise<{ success: boolean; error?: string }>;
      };
      inventory: {
        deduct: (id: string, amt: number) => Promise<{ success: boolean; error?: string }>;
        checkLow: () => Promise<{ success: boolean; data?: any; error?: string }>;
      };
      printer: {
        printReceipt: (lines: string[]) => Promise<{ success: boolean; error?: string }>;
        kickDrawer: () => Promise<{ success: boolean; error?: string }>;
        scanDevices: () => Promise<{ success: boolean; data?: any; error?: string }>;
      };
      window: { minimize: () => void; maximize: () => void; close: () => void };
    };
  }
}

export default function App() {
  const { currentUser, login } = useStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate some initialization (e.g., checking session, DB, etc.)
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Barcode scanner listener (simulated HID input)
    let buffer = "";
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        if (buffer.length > 3) {
          console.log("Barcode scanned:", buffer);
          // Here you would look up the item by barcode
          // window.api.db.query("SELECT * FROM drinks WHERE barcode = ?", [buffer]);
        }
        buffer = "";
      } else if (e.key.length === 1) {
        buffer += e.key;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleLogin = useCallback(async (pin: string) => {
    const result = await window.api.auth.login(pin);
    if (result.success && result.user) {
      login(result.user);
      return true;
    }
    return false;
  }, [login]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-pos-bg">
        <div className="text-pos-text-muted animate-pulse">Loading GustoOSX...</div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return <POSLayout />;
}
