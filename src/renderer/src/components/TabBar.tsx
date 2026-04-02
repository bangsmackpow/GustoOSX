import { useState, useEffect } from "react";
import { useStore } from "../store";
import { Plus, X, List } from "lucide-react";

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
      setTabs(result.data);
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
        quantity: o.quantity,
        unitPrice: o.unit_price,
        voided: !!o.voided,
      })));
    }
  };

  const handleOpenTab = async () => {
    if (!tabName.trim() || !currentUser) return;
    const newTab = {
      id: crypto.randomUUID(),
      nickname: tabName.trim(),
      status: "open" as const,
      staffUserId: currentUser.id,
      totalAmount: 0,
      openedAt: new Date().toISOString(),
    };

    const result = await window.api.db.run(
      "INSERT INTO tabs (id, nickname, status, staff_user_id, total_amount, opened_at) VALUES (?, ?, ?, ?, ?, ?)",
      [newTab.id, newTab.nickname, newTab.status, newTab.staffUserId, newTab.totalAmount, Math.floor(Date.now() / 1000)]
    );

    if (result.success) {
      addTab(newTab);
      setTabName("");
      setShowNewTab(false);
    }
  };

  return (
    <div className="flex items-center gap-2 p-3 border-b border-pos-border overflow-x-auto">
      {/* Existing tabs */}
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setCurrentTab(tab.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
            currentTabId === tab.id
              ? "bg-pos-accent text-black"
              : "bg-pos-surface border border-pos-border text-pos-text-muted hover:border-pos-accent"
          }`}
        >
          {tab.nickname}
        </button>
      ))}

      {/* New tab button/input */}
      {showNewTab ? (
        <div className="flex items-center gap-2 min-w-[200px]">
          <input
            type="text"
            value={tabName}
            onChange={(e) => setTabName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleOpenTab()}
            placeholder="Name or #"
            className="flex-1 bg-pos-bg border border-pos-border rounded-lg px-3 py-2 text-sm focus:border-pos-accent focus:outline-none"
            autoFocus
          />
          <button
            onClick={handleOpenTab}
            className="bg-pos-accent text-black px-4 py-2 rounded-lg text-sm font-medium"
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
          className="flex items-center gap-2 bg-pos-surface border border-pos-border rounded-lg px-4 py-2 text-sm text-pos-text-muted hover:border-pos-accent hover:text-pos-text transition-all"
        >
          <Plus className="w-4 h-4" />
          New Tab
        </button>
      )}
    </div>
  );
}
