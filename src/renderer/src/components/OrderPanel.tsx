import { useState, useMemo } from "react";
import { useStore } from "../store";
import { Trash2, Printer, CreditCard, Banknote, ShieldAlert, Settings2, CreditCardIcon } from "lucide-react";
import { TabManagementModal } from "./TabManagementModal";

export function OrderPanel() {
  const { currentUser, currentTabId, tabs, orders, removeOrder, voidOrder, closeTab, language, updateTab } = useStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showVoidPin, setShowVoidPin] = useState<string | null>(null);
  const [voidPin, setVoidPin] = useState("");
  const [showTabMgmt, setShowTabMgmt] = useState(false);

  const currentTab = useMemo(() => tabs.find((t) => t.id === currentTabId), [tabs, currentTabId]);
  const activeOrders = useMemo(() => orders.filter((o) => !o.voided), [orders]);
  const total = useMemo(() => activeOrders.reduce((sum, o) => sum + o.unitPrice * o.quantity, 0), [activeOrders]);

  const toggleKeepCard = async () => {
    if (!currentTabId || !currentTab) return;
    const newValue = !currentTab.keepCard;
    const result = await window.api.db.run("UPDATE tabs SET keep_card = ? WHERE id = ?", [newValue ? 1 : 0, currentTabId]);
    if (result.success) {
      updateTab(currentTabId, { keepCard: newValue });
    }
  };

  const handlePrint = async () => {
    if (!currentTab) return;
    const isEs = language === "es";
    
    const lines = [
      "================================",
      currentTab.nickname || (isEs ? "Cuenta" : "Tab"),
      new Date().toLocaleString(isEs ? "es-MX" : "en-US"),
      "--------------------------------",
      ...activeOrders.flatMap((o) => {
        const name = (isEs && o.drinkNameEs) ? o.drinkNameEs : o.drinkName;
        const mods = o.modifiers ? JSON.parse(o.modifiers).map((m: any) => isEs && m.nameEs ? m.nameEs : m.name).join(", ") : "";
        
        const orderLines = [`${o.quantity}x ${name}`];
        if (mods) orderLines.push(`   (${mods})`);
        orderLines.push(`   $${(o.unitPrice * o.quantity).toFixed(2)}`);
        return orderLines;
      }),
      "--------------------------------",
      `${isEs ? "TOTAL" : "TOTAL"}: $${total.toFixed(2)}`,
      "================================",
      "",
      isEs ? "   ¡MUCHAS GRACIAS!   " : "   THANK YOU!   ",
      "",
    ];
    await window.api.printer.printReceipt(lines);
  };

  const handleCheckout = async (method: "cash" | "card") => {
    if (!currentTabId || !currentTab) return;
    setIsProcessing(true);
    try {
      // 1. Deduct inventory
      for (const order of activeOrders) {
        const recipes = await window.api.db.query(
          "SELECT ingredient_id, amount_in_ml FROM recipe_ingredients WHERE drink_id = ?",
          [order.drinkId]
        );
        if (recipes.success && recipes.data) {
          for (const r of recipes.data) {
            await window.api.inventory.deduct(r.ingredient_id, r.amount_in_ml * order.quantity);
          }
        }
      }

      // 2. Update Tab in DB
      await window.api.db.run(
        "UPDATE tabs SET status = 'closed', payment_method = ?, total_amount = ?, closed_at = unixepoch() WHERE id = ?",
        [method, total, currentTabId]
      );

      // 3. Hardware integration
      if (method === "cash") {
        await handlePrint();
        await window.api.printer.kickDrawer();
      }

      // 4. Update store
      closeTab(currentTabId);
    } catch (err) {
      console.error("Checkout failed:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVoidClick = (orderId: string) => {
    if (currentUser?.role === "admin" || currentUser?.role === "manager") {
      performVoid(orderId, currentUser.id);
    } else {
      setShowVoidPin(orderId);
      setVoidPin("");
    }
  };

  const performVoid = async (orderId: string, voidedBy: string) => {
    const result = await window.api.db.run(
      "UPDATE orders SET voided = 1, voided_by = ? WHERE id = ?",
      [voidedBy, orderId]
    );
    if (result.success) {
      voidOrder(orderId);
      setShowVoidPin(null);
    }
  };

  const handleVoidPinSubmit = async () => {
    if (!showVoidPin) return;
    const result = await window.api.db.query(
      "SELECT id FROM users WHERE pin = ? AND (role = 'admin' OR role = 'manager')",
      [voidPin]
    );
    if (result.success && result.data.length > 0) {
      performVoid(showVoidPin, result.data[0].id);
    } else {
      alert("Invalid Manager PIN");
      setVoidPin("");
    }
  };

  if (!currentTabId || !currentTab) {
    return (
      <div className="w-80 bg-pos-surface border-l border-pos-border flex items-center justify-center">
        <div className="text-center text-pos-text-muted p-6">
          <p className="text-sm font-medium">No active tab</p>
          <p className="text-xs mt-2">Select an existing tab or open a new one to start ordering.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-pos-surface border-l border-pos-border flex flex-col shadow-2xl">
      {/* Tab header */}
      <div className="p-4 border-b border-pos-border bg-pos-bg/50">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg text-pos-accent">{currentTab.nickname}</h2>
          <div className="flex items-center gap-1">
            <button 
              onClick={toggleKeepCard}
              className={`p-2 rounded-xl transition-all flex items-center gap-2 ${
                currentTab.keepCard 
                  ? "bg-pos-accent text-black" 
                  : "hover:bg-pos-surface text-pos-text-muted"
              }`}
              title={currentTab.keepCard ? "Holding Card" : "Hold Card?"}
            >
              <CreditCardIcon className="w-4 h-4" />
              {currentTab.keepCard && <span className="text-[8px] font-black uppercase">Holding</span>}
            </button>
            <button 
              onClick={() => setShowTabMgmt(true)}
              className="p-2 hover:bg-pos-surface rounded-xl text-pos-text-muted hover:text-pos-accent transition-all"
            >
              <Settings2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex justify-between items-center mt-1">
          <p className="text-[10px] text-pos-text-muted uppercase tracking-wider">
            {activeOrders.length} item{activeOrders.length !== 1 ? "s" : ""}
          </p>
          <p className="text-[10px] text-pos-text-muted uppercase tracking-wider">
            Started {new Date(currentTab.openedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>

      {/* Order items */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {orders.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-30">
            <p className="text-sm italic">Tab is empty</p>
          </div>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              className={`group flex flex-col bg-pos-bg rounded-xl border border-pos-border/50 p-3 transition-all ${
                order.voided ? "opacity-40 grayscale" : "hover:border-pos-accent/30"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0 pr-2">
                  <p className="text-sm font-medium truncate">
                    {order.quantity > 1 && <span className="text-pos-accent mr-1">{order.quantity}x</span>}
                    {order.drinkName}
                  </p>
                  {order.modifiers && (
                    <p className="text-[10px] text-pos-accent/70 font-bold uppercase tracking-tighter mt-0.5">
                      {JSON.parse(order.modifiers).map((m: any) => m.name).join(", ")}
                    </p>
                  )}
                  <p className="text-[11px] text-pos-text-muted mt-0.5">
                    ${order.unitPrice.toFixed(2)} each
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`text-sm font-bold ${order.voided ? "line-through" : "text-pos-text"}`}>
                    ${(order.unitPrice * order.quantity).toFixed(2)}
                  </span>
                  {!order.voided && (
                    <button
                      onClick={() => handleVoidClick(order.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-pos-text-muted hover:text-pos-danger transition-all"
                      title="Void Item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {showVoidPin === order.id && (
                <div className="mt-3 pt-3 border-t border-pos-border/30 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-pos-danger">
                    <ShieldAlert className="w-3 h-3" />
                    <span className="text-[10px] font-bold uppercase">Manager Override Required</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      value={voidPin}
                      onChange={(e) => setVoidPin(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleVoidPinSubmit()}
                      placeholder="PIN"
                      className="w-20 bg-pos-surface border border-pos-danger/30 rounded px-2 py-1 text-xs focus:outline-none focus:border-pos-danger"
                      autoFocus
                    />
                    <button
                      onClick={handleVoidPinSubmit}
                      className="bg-pos-danger text-white text-[10px] px-2 py-1 rounded font-bold hover:bg-pos-danger/80"
                    >
                      VOID
                    </button>
                    <button
                      onClick={() => setShowVoidPin(null)}
                      className="text-pos-text-muted text-[10px] px-2 py-1 hover:text-pos-text"
                    >
                      CANCEL
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Total and checkout */}
      <div className="p-4 border-t border-pos-border space-y-4 bg-pos-bg/30">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-pos-text-muted text-xs">
            <span>Subtotal</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-pos-text-muted text-xs">
            <span>Tax (0%)</span>
            <span>$0.00</span>
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="text-base font-bold">Total</span>
            <span className="text-2xl font-black text-pos-accent tracking-tight">${total.toFixed(2)}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleCheckout("cash")}
            disabled={activeOrders.length === 0 || isProcessing}
            className="flex flex-col items-center justify-center gap-1 bg-pos-success/90 text-white p-3 rounded-xl hover:bg-pos-success transition-all active:scale-95 disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed group"
          >
            <Banknote className="w-5 h-5 mb-1 transition-transform group-hover:-translate-y-0.5" />
            <span className="text-xs font-bold uppercase tracking-wider">Cash</span>
          </button>
          <button
            onClick={() => handleCheckout("card")}
            disabled={activeOrders.length === 0 || isProcessing}
            className="flex flex-col items-center justify-center gap-1 bg-pos-accent text-black p-3 rounded-xl hover:bg-pos-accent-hover transition-all active:scale-95 disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed group"
          >
            <CreditCard className="w-5 h-5 mb-1 transition-transform group-hover:-translate-y-0.5" />
            <span className="text-xs font-bold uppercase tracking-wider">Card</span>
          </button>
        </div>

        <button
          onClick={handlePrint}
          disabled={activeOrders.length === 0}
          className="w-full flex items-center justify-center gap-2 bg-pos-surface border border-pos-border text-pos-text-muted py-2.5 rounded-xl hover:border-pos-accent hover:text-pos-text transition-all disabled:opacity-30 disabled:cursor-not-allowed text-xs font-medium uppercase tracking-widest"
        >
          <Printer className="w-4 h-4" />
          <span>Print Guest Check</span>
        </button>
      </div>

      {showTabMgmt && (
        <TabManagementModal 
          tab={currentTab} 
          orders={orders} 
          onClose={() => setShowTabMgmt(false)} 
        />
      )}
    </div>
  );
}
