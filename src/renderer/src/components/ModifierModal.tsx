import { useState, useEffect } from "react";
import { X, Check } from "lucide-react";

interface Modifier {
  id: string;
  name: string;
  price: number;
  category: string;
}

interface ModifierModalProps {
  drink: any;
  onClose: () => void;
  onConfirm: (selectedModifiers: Modifier[]) => void;
}

export function ModifierModal({ drink, onClose, onConfirm }: ModifierModalProps) {
  const [availableModifiers, setAvailableModifiers] = useState<Modifier[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadModifiers();
  }, []);

  const loadModifiers = async () => {
    const result = await window.api.db.query("SELECT * FROM modifiers ORDER BY category, name", []);
    if (result.success) {
      setAvailableModifiers(result.data);
    }
    setLoading(false);
  };

  const toggleModifier = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleConfirm = () => {
    const selected = availableModifiers.filter(m => selectedIds.includes(m.id));
    onConfirm(selected);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-pos-surface border border-pos-border w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-pos-border flex items-center justify-between bg-pos-bg/50">
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight text-pos-accent">{drink.name}</h2>
            <p className="text-pos-text-muted text-xs font-bold uppercase tracking-widest mt-1">Select Modifiers</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-pos-surface-hover rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="py-12 text-center text-pos-text-muted animate-pulse font-bold uppercase tracking-widest text-xs">Loading options...</div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {availableModifiers.map((mod) => {
                const isSelected = selectedIds.includes(mod.id);
                return (
                  <button
                    key={mod.id}
                    onClick={() => toggleModifier(mod.id)}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                      isSelected 
                        ? "bg-pos-accent border-pos-accent text-black shadow-lg shadow-pos-accent/20" 
                        : "bg-pos-bg border-pos-border text-pos-text hover:border-pos-accent/50"
                    }`}
                  >
                    <div className="text-left">
                      <p className="text-sm font-bold">{mod.name}</p>
                      {mod.price > 0 && <p className={`text-[10px] font-black ${isSelected ? "text-black/60" : "text-pos-accent"}`}>+${mod.price.toFixed(2)}</p>}
                    </div>
                    {isSelected && <Check className="w-4 h-4" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-6 bg-pos-bg/50 border-t border-pos-border flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest border border-pos-border hover:bg-pos-surface transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-[2] bg-pos-accent text-black px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-pos-accent/20"
          >
            Add to Order
          </button>
        </div>
      </div>
    </div>
  );
}
