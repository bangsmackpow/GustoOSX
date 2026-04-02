import { useState, useEffect, useRef } from "react";
import { useStore, Drink } from "../store";
import { X, Plus } from "lucide-react";

interface QuickSearchProps {
  drinks: Drink[];
  onClose: () => void;
}

export function QuickSearch({ drinks, onClose }: QuickSearchProps) {
  const [query, setQuery] = useState("");
  const { addOrder, currentTab, toggleQuickSearch } = useStore();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // Global shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const filtered = query.length > 0
    ? drinks.filter(
        (d) =>
          d.name.toLowerCase().includes(query.toLowerCase()) ||
          d.category.toLowerCase().includes(query.toLowerCase())
      )
    : drinks.slice(0, 20);

  const handleSelect = (drink: Drink) => {
    if (currentTab) {
      addOrder({
        id: crypto.randomUUID(),
        tabId: currentTab.id,
        drinkId: drink.id,
        drinkName: drink.name,
        quantity: 1,
        unitPrice: drink.actualPrice,
        voided: false,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-24 z-50" onClick={onClose}>
      <div
        className="w-[600px] max-h-[500px] bg-pos-surface border border-pos-border rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 p-4 border-b border-pos-border">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search drinks..."
            className="flex-1 bg-transparent text-pos-text text-lg focus:outline-none placeholder:text-pos-text-muted"
          />
          <button onClick={onClose} className="text-pos-text-muted hover:text-pos-text transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-y-auto max-h-[400px]">
          {filtered.length === 0 ? (
            <p className="p-6 text-center text-pos-text-muted">No results</p>
          ) : (
            filtered.map((drink) => (
              <button
                key={drink.id}
                onClick={() => handleSelect(drink)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-pos-surface-hover transition-colors text-left"
              >
                <div>
                  <p className="text-sm font-medium">{drink.name}</p>
                  <p className="text-xs text-pos-text-muted">{drink.category}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-pos-accent font-semibold">${drink.actualPrice.toFixed(2)}</span>
                  <Plus className="w-4 h-4 text-pos-text-muted" />
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
