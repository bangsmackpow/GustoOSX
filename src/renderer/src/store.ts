import { create } from "zustand";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "admin" | "manager" | "bartender" | "server";
  pin: string;
  isActive: boolean;
}

export interface Drink {
  id: string;
  name: string;
  nameEs?: string;
  description?: string;
  category: string;
  actualPrice: number;
  isAvailable: boolean;
}

export interface Tab {
  id: string;
  nickname: string;
  tableNumber?: string;
  keepCard: boolean;
  status: "open" | "closed";
  staffUserId: string;
  totalAmount: number;
  notes?: string;
  openedAt: string;
}

export interface OrderItem {
  id: string;
  tabId: string;
  drinkId: string;
  drinkName: string;
  drinkNameEs?: string;
  quantity: number;
  unitPrice: number;
  modifiers?: string; // JSON string
  notes?: string;
  voided: boolean;
}

interface AppState {
  currentUser: User | null;
  currentTabId: string | null;
  tabs: Tab[];
  orders: OrderItem[]; // Current tab's orders
  language: "en" | "es";
  showQuickSearch: boolean;
  activeCategory: string;
  activeView: "pos" | "inventory" | "reports" | "staff" | "settings";

  // Actions
  login: (user: User) => void;
  logout: () => void;
  setTabs: (tabs: Tab[]) => void;
  setCurrentTab: (tabId: string | null) => void;
  addTab: (tab: Tab) => void;
  updateTab: (tabId: string, updates: Partial<Tab>) => void;
  closeTab: (tabId: string) => void;
  setOrders: (orders: OrderItem[]) => void;
  addOrder: (item: OrderItem) => void;
  removeOrder: (orderId: string) => void;
  voidOrder: (orderId: string) => void;
  setLanguage: (lang: "en" | "es") => void;
  toggleQuickSearch: () => void;
  setActiveCategory: (category: string) => void;
  setActiveView: (view: "pos" | "inventory" | "reports" | "staff" | "settings") => void;
}

export const useStore = create<AppState>((set) => ({
  currentUser: null,
  currentTabId: null,
  tabs: [],
  orders: [],
  language: "en",
  showQuickSearch: false,
  activeCategory: "all",
  activeView: "pos",

  login: (user) => set({ currentUser: user }),
  logout: () => set({ currentUser: null, currentTabId: null, tabs: [], orders: [] }),
  setTabs: (tabs) => set({ tabs }),
  setCurrentTab: (tabId) => set({ currentTabId: tabId }),
  addTab: (tab) => set((state) => ({ tabs: [...state.tabs, tab], currentTabId: tab.id })),
  updateTab: (tabId, updates) => 
    set((state) => ({
      tabs: state.tabs.map((t) => t.id === tabId ? { ...t, ...updates } : t)
    })),
  closeTab: (tabId) =>
    set((state) => ({
      tabs: state.tabs.filter((t) => t.id !== tabId),
      currentTabId: state.currentTabId === tabId ? null : state.currentTabId,
      orders: state.currentTabId === tabId ? [] : state.orders,
    })),
  setOrders: (orders) => set({ orders }),
  addOrder: (item) => set((state) => ({ orders: [...state.orders, item] })),
  removeOrder: (orderId) =>
    set((state) => ({ orders: state.orders.filter((o) => o.id !== orderId) })),
  voidOrder: (orderId) =>
    set((state) => ({
      orders: state.orders.map((o) => (o.id === orderId ? { ...o, voided: true } : o)),
    })),
  setLanguage: (lang) => set({ language: lang }),
  toggleQuickSearch: () => set((state) => ({ showQuickSearch: !state.showQuickSearch })),
  setActiveCategory: (category) => set({ activeCategory: category }),
  setActiveView: (view) => set({ activeView: view }),
}));
