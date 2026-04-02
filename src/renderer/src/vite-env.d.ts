export {};

declare global {
  interface Window {
    api: {
      auth: {
        login: (pin: string) => Promise<{ success: boolean; user?: any; error?: string }>;
      };
      db: {
        query: (query: string, params: unknown[]) => Promise<{ success: boolean; data?: any; error?: string }>;
      };
      inventory: {
        deduct: (ingredientId: string, amount: number) => Promise<{ success: boolean; error?: string }>;
        checkLow: () => Promise<{ success: boolean; data?: any; error?: string }>;
      };
      printer: {
        printReceipt: (lines: string[]) => Promise<{ success: boolean; error?: string }>;
        kickDrawer: () => Promise<{ success: boolean; error?: string }>;
        scanDevices: () => Promise<{ success: boolean; data?: any; error?: string }>;
      };
      window: {
        minimize: () => void;
        maximize: () => void;
        close: () => void;
      };
    };
  }
}
