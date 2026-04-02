import { useState, useEffect } from "react";
import { useStore } from "../store";
import { Plus, X, LayoutGrid } from "lucide-react";

export function TabBar() {
  const { currentUser, tabs, setTabs, currentTabId, setCurrentTab, addTab, setOrders } = useStore();
  const [showNewTab, setShowNewTab] = useState(false);
  const [tabName, setTabName] = useState("");

  useEffect(() => {
    loadTabs();
  }, []);

  useEffect(() => {
    if (currentTabId) {
      loadOrders(currentTabId);
    } else {
      setOrders([]);
    }
  }, [currentTabId]);

  const loadTabs = async () => {
    const result = await window.api.db.query("SELECT * FROM tabs WHERE status = 'open'", []);
    if (result.success) {
      setTabs(result.data.map((t: any) => ({
        id: t.id,
        nickname: t.nickname,
        status: t.status,
        staffUserId: t.staff_user_id,
        totalAmount: t.total_amount,
        keepCard: !!t.keep_card,
        tableNumber: t.table_number,
        openedAt: new Date(t.opened_at * 1000).toISOString(),
      })));
    }
  };

  const loadOrders = async (tabId: string) => {
    const result = await window.api.db.query("SELECT * FROM orders WHERE tab_id = ? AND voided = 0", [tabId]);
    if (result.success) {
      setOrders(result.data.map((o: any) => ({
        id: o.id,
        tabId: o.tab_id,
        drinkId: o.drink_id,
        drinkName: o.drink_name,
        drinkNameEs: o.drink_name_es,
        quantity: o.quantity,
        unitPrice: o.unit_price,
        modifiers: o.modifiers,
        voided: !!o.voided,
      })));
    }
  };

  const handleOpenTab = async () => {
    if (!tabName.trim() || !currentUser) return;
    
    // Check if input is a table number (e.g., "T4" or just "4")
    const isTableNum = /^[Tt]?\d+$/.test(tabName.trim());
    const nickname = tabName.trim();
    const tableNumber = isTableNum ? tabName.trim().replace(/[Tt]/, "") : null;

    const newTab = {
      id: crypto.randomUUID(),
      nickname: nickname,
      tableNumber: tableNumber || undefined,
      keepCard: false,
      status: "open" as const,
      staffUserId: currentUser.id,
      totalAmount: 0,
      openedAt: new Date().toISOString(),
    };

    const result = await window.api.db.run(
      "INSERT INTO tabs (id, nickname, table_number, keep_card, status, staff_user_id, total_amount, opened_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [newTab.id, newTab.nickname, newTab.tableNumber || null, 0, newTab.status, newTab.staffUserId, newTab.totalAmount, Math.floor(Date.now() / 1000)]
    );

    if (result.success) {
      addTab(newTab);
      setTabName("");
      setShowNewTab(false);
    }
  };

  return (
    <div className="flex items-center gap-2 p-3 border-b border-pos-border overflow-x-auto bg-pos-bg/40">
      {/* Existing tabs */}
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setCurrentTab(tab.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
            currentTabId === tab.id
              ? "bg-pos-accent border-pos-accent text-black shadow-lg shadow-pos-accent/20"
              : "bg-pos-surface border-pos-border text-pos-text-muted hover:border-pos-accent"
          }`}
        >
          {tab.tableNumber && <span className="opacity-50 mr-1">T{tab.tableNumber}</span>}
          {tab.nickname}
          {tab.keepCard && <div className="w-1.5 h-1.5 rounded-full bg-pos-danger animate-pulse" />}
        </button>
      ))}

      {/* New tab button/input */}
      {showNewTab ? (
        <div className="flex items-center gap-2 min-w-[200px] animate-in slide-in-from-left-2">
          <input
            type="text"
            value={tabName}
            onChange={(e) => setTabName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleOpenTab()}
            placeholder="Name or T#"
            className="flex-1 bg-pos-bg border border-pos-border rounded-xl px-4 py-2 text-xs font-bold focus:border-pos-accent focus:outline-none uppercase"
            autoFocus
          />
          <button
            onClick={handleOpenTab}
            className="bg-pos-accent text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest"
          >
            Add
          </button>
          <button
            onClick={() => setShowNewTab(false)}
            className="text-pos-text-muted hover:text-pos-text"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowNewTab(true)}
          className="flex items-center gap-2 bg-pos-surface border border-pos-border rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest text-pos-text-muted hover:border-pos-accent hover:text-pos-text transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          New Tab
        </button>
      )}
    </div>
  );
}
