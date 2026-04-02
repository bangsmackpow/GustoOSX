import { useState } from "react";
import { X, ArrowRightLeft, Scissors, Edit3 } from "lucide-react";
import { useStore } from "../store";

interface TabManagementModalProps {
  tab: any;
  orders: any[];
  onClose: () => void;
}

export function TabManagementModal({ tab, orders, onClose }: TabManagementModalProps) {
  const { tabs, addTab, updateTab, removeOrder } = useStore();
  const [newNickname, setNewNickname] = useState(tab.nickname);
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [mode, setMode] = useState<"options" | "rename" | "split">("options");

  const activeOrders = orders.filter(o => !o.voided);

  const handleRename = async () => {
    const result = await window.api.db.run("UPDATE tabs SET nickname = ? WHERE id = ?", [newNickname, tab.id]);
    if (result.success) {
      updateTab(tab.id, { nickname: newNickname });
      onClose();
    }
  };

  const handleSplit = async () => {
    if (selectedOrderIds.length === 0) return;

    // 1. Create new tab
    const newTab = {
      id: crypto.randomUUID(),
      nickname: `${tab.nickname} (Split)`,
      status: "open" as const,
      staffUserId: tab.staffUserId,
      totalAmount: 0,
      openedAt: new Date().toISOString(),
    };

    const tabResult = await window.api.db.run(
      "INSERT INTO tabs (id, nickname, status, staff_user_id, total_amount, opened_at) VALUES (?, ?, ?, ?, ?, ?)",
      [newTab.id, newTab.nickname, newTab.status, newTab.staffUserId, newTab.totalAmount, Math.floor(Date.now() / 1000)]
    );

    if (tabResult.success) {
      // 2. Move selected orders to new tab
      for (const orderId of selectedOrderIds) {
        await window.api.db.run("UPDATE orders SET tab_id = ? WHERE id = ?", [newTab.id, orderId]);
        removeOrder(orderId);
      }
      addTab(newTab);
      onClose();
    }
  };

  const toggleOrderSelection = (id: string) => {
    setSelectedOrderIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-pos-surface border border-pos-border w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-pos-border flex items-center justify-between bg-pos-bg/50">
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight text-pos-accent">{tab.nickname}</h2>
            <p className="text-pos-text-muted text-xs font-bold uppercase tracking-widest mt-1">Management</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-pos-surface-hover rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {mode === "options" && (
            <div className="grid grid-cols-1 gap-4">
              <button
                onClick={() => setMode("rename")}
                className="flex items-center gap-4 p-5 rounded-2xl border border-pos-border hover:border-pos-accent hover:bg-pos-surface-hover transition-all group"
              >
                <div className="bg-pos-bg p-3 rounded-xl group-hover:text-pos-accent transition-colors">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-black uppercase tracking-widest">Rename Tab</p>
                  <p className="text-xs text-pos-text-muted mt-1 font-medium">Change the nickname or table number</p>
                </div>
              </button>

              <button
                onClick={() => setMode("split")}
                className="flex items-center gap-4 p-5 rounded-2xl border border-pos-border hover:border-pos-accent hover:bg-pos-surface-hover transition-all group"
              >
                <div className="bg-pos-bg p-3 rounded-xl group-hover:text-pos-accent transition-colors">
                  <Scissors className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-black uppercase tracking-widest">Split Check</p>
                  <p className="text-xs text-pos-text-muted mt-1 font-medium">Move specific items to a new tab</p>
                </div>
              </button>
            </div>
          )}

          {mode === "rename" && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-pos-text-muted ml-1">New Nickname</label>
                <input
                  type="text"
                  value={newNickname}
                  onChange={(e) => setNewNickname(e.target.value)}
                  className="w-full bg-pos-bg border border-pos-border rounded-2xl px-5 py-4 text-sm focus:border-pos-accent focus:outline-none transition-all font-bold"
                  autoFocus
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setMode("options")}
                  className="flex-1 px-6 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest border border-pos-border hover:bg-pos-surface"
                >
                  Back
                </button>
                <button
                  onClick={handleRename}
                  className="flex-[2] bg-pos-accent text-black px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] shadow-lg shadow-pos-accent/20"
                >
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {mode === "split" && (
            <div className="space-y-6">
              <p className="text-[10px] font-black uppercase tracking-widest text-pos-text-muted ml-1">Select items to move</p>
              <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                {activeOrders.map((order) => (
                  <button
                    key={order.id}
                    onClick={() => toggleOrderSelection(order.id)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                      selectedOrderIds.includes(order.id)
                        ? "bg-pos-accent/10 border-pos-accent text-pos-accent"
                        : "bg-pos-bg border-pos-border text-pos-text hover:border-pos-border-hover"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                        selectedOrderIds.includes(order.id) ? "bg-pos-accent border-pos-accent" : "border-pos-border"
                      }`}>
                        {selectedOrderIds.includes(order.id) && <X className="w-3 h-3 text-black" />}
                      </div>
                      <span className="text-xs font-bold uppercase tracking-tight">{order.drinkName}</span>
                    </div>
                    <span className="text-xs font-black tabular-nums">${order.unitPrice.toFixed(2)}</span>
                  </button>
                ))}
              </div>
              <div className="flex gap-3 pt-2 border-t border-pos-border/50">
                <button
                  onClick={() => setMode("options")}
                  className="flex-1 px-6 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest border border-pos-border hover:bg-pos-surface"
                >
                  Back
                </button>
                <button
                  onClick={handleSplit}
                  disabled={selectedOrderIds.length === 0}
                  className="flex-[2] bg-pos-accent text-black px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] disabled:opacity-30 disabled:scale-100 shadow-lg shadow-pos-accent/20"
                >
                  Split {selectedOrderIds.length} Items
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
