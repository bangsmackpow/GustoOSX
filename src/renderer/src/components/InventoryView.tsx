import { useState, useEffect } from "react";
import { useStore } from "../store";
import { Package, Plus, Minus, AlertTriangle, RefreshCw, Save, Trash2 } from "lucide-react";

interface Ingredient {
  id: string;
  name: string;
  category: string;
  unit: string;
  unitSize: number;
  currentStock: number;
  minimumStock: number;
}

export function InventoryView() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [restockValues, setRestockValues] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadIngredients();
  }, []);

  const loadIngredients = async () => {
    setLoading(true);
    const result = await window.api.db.query("SELECT * FROM ingredients ORDER BY category, name", []);
    if (result.success) {
      setIngredients(result.data);
    }
    setLoading(false);
  };

  const handleRestockChange = (id: string, value: string) => {
    setRestockValues(prev => ({ ...prev, [id]: value }));
  };

  const handleSaveRestock = async (id: string) => {
    const amount = parseFloat(restockValues[id]);
    if (isNaN(amount) || amount === 0) return;

    setIsSaving(true);
    const result = await window.api.db.run(
      "UPDATE ingredients SET current_stock = current_stock + ?, updated_at = unixepoch() WHERE id = ?",
      [amount, id]
    );

    if (result.success) {
      setRestockValues(prev => ({ ...prev, [id]: "" }));
      await loadIngredients();
    }
    setIsSaving(false);
  };

  const handleWasteLog = async (id: string) => {
    const amount = parseFloat(restockValues[id]);
    if (isNaN(amount) || amount === 0) return;

    setIsSaving(true);
    // Log as negative restocking for now, or could add a waste_logs table
    const result = await window.api.db.run(
      "UPDATE ingredients SET current_stock = current_stock - ?, updated_at = unixepoch() WHERE id = ?",
      [amount, id]
    );

    if (result.success) {
      setRestockValues(prev => ({ ...prev, [id]: "" }));
      await loadIngredients();
    }
    setIsSaving(false);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Package className="w-8 h-8 text-pos-accent animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-pos-bg">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter">Inventory Audit</h1>
            <p className="text-pos-text-muted text-sm mt-1">Manage stock levels and record restocking</p>
          </div>
          <button 
            onClick={loadIngredients}
            className="bg-pos-surface border border-pos-border text-pos-text px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:border-pos-accent transition-all flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        <div className="bg-pos-surface border border-pos-border rounded-[2.5rem] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] uppercase font-black text-pos-text-muted border-b border-pos-border bg-pos-surface-hover/30">
                  <th className="px-8 py-5">Ingredient</th>
                  <th className="px-6 py-5">Category</th>
                  <th className="px-6 py-5">Unit</th>
                  <th className="px-6 py-5 text-center">In Stock</th>
                  <th className="px-6 py-5">Bulk Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pos-border/50">
                {ingredients.map((ing) => {
                  const isLow = ing.currentStock <= ing.minimumStock;
                  return (
                    <tr key={ing.id} className={`group hover:bg-pos-surface-hover/50 transition-colors ${isLow ? 'bg-pos-danger/5' : ''}`}>
                      <td className="px-8 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-black uppercase tracking-tight">{ing.name}</span>
                          {isLow && (
                            <span className="flex items-center gap-1 text-[9px] text-pos-danger font-bold uppercase mt-0.5">
                              <AlertTriangle className="w-3 h-3" />
                              Critically Low
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] uppercase font-bold text-pos-text-muted bg-pos-bg px-2 py-1 rounded-full border border-pos-border/50">
                          {ing.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-medium text-pos-text-muted">{ing.unit}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`text-sm font-black tabular-nums ${isLow ? 'text-pos-danger' : 'text-pos-accent'}`}>
                          {ing.currentStock.toFixed(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            placeholder="Amt"
                            value={restockValues[ing.id] || ""}
                            onChange={(e) => handleRestockChange(ing.id, e.target.value)}
                            className="w-20 bg-pos-bg border border-pos-border rounded-xl px-3 py-2 text-xs focus:border-pos-accent focus:outline-none transition-all font-bold"
                          />
                          <button
                            onClick={() => handleSaveRestock(ing.id)}
                            className="p-2 bg-pos-success/20 text-pos-success rounded-xl hover:bg-pos-success hover:text-white transition-all shadow-sm"
                            title="Restock"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleWasteLog(ing.id)}
                            className="p-2 bg-pos-danger/20 text-pos-danger rounded-xl hover:bg-pos-danger hover:text-white transition-all shadow-sm"
                            title="Log Waste"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
