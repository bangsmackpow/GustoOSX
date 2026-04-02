import { useState } from "react";
import { useStore, Drink } from "../store";
import { ModifierModal } from "./ModifierModal";

interface MenuGridProps {
  drinks: Drink[];
}

export function MenuGrid({ drinks }: MenuGridProps) {
  const { addOrder, currentTabId } = useStore();
  const [selectedDrink, setSelectedDrink] = useState<Drink | null>(null);

  const handleDrinkClick = (drink: Drink) => {
    if (!currentTabId) return;
    
    // Show modifiers for spirits, cocktails, and shots
    if (["cocktail", "shot"].includes(drink.category)) {
      setSelectedDrink(drink);
    } else {
      handleAddOrder(drink, []);
    }
  };

  const handleAddOrder = async (drink: Drink, modifiers: any[]) => {
    if (!currentTabId) return;
    
    const modifierTotal = modifiers.reduce((sum, m) => sum + m.price, 0);
    const unitPrice = drink.actualPrice + modifierTotal;
    
    const newOrder = {
      id: crypto.randomUUID(),
      tabId: currentTabId,
      drinkId: drink.id,
      drinkName: drink.name,
      quantity: 1,
      unitPrice: unitPrice,
      modifiers: modifiers.length > 0 ? JSON.stringify(modifiers) : undefined,
      voided: false,
    };

    const result = await window.api.db.run(
      "INSERT INTO orders (id, tab_id, drink_id, drink_name, quantity, unit_price, modifiers, voided, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [newOrder.id, newOrder.tabId, newOrder.drinkId, newOrder.drinkName, newOrder.quantity, newOrder.unitPrice, newOrder.modifiers || null, 0, Math.floor(Date.now() / 1000)]
    );

    if (result.success) {
      addOrder(newOrder);
      setSelectedDrink(null);
    }
  };

  if (drinks.length === 0) {
    return (
      <div className="flex items-center justify-center flex-1 text-pos-text-muted font-bold uppercase tracking-widest text-[10px] opacity-20">
        No items in category
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {drinks.map((drink) => (
          <button
            key={drink.id}
            onClick={() => handleDrinkClick(drink)}
            className="bg-pos-surface border border-pos-border rounded-[2rem] p-5 text-left hover:border-pos-accent hover:bg-pos-surface-hover transition-all active:scale-[0.96] group shadow-sm hover:shadow-lg relative overflow-hidden"
          >
            <div className="flex flex-col gap-2 h-full justify-between relative z-10">
              <div className="flex flex-col gap-1">
                <div className="flex items-start justify-between">
                  <h3 className="font-black text-sm text-pos-text group-hover:text-pos-accent transition-colors leading-tight uppercase tracking-tight">
                    {drink.name}
                  </h3>
                </div>
                {drink.description && (
                  <p className="text-[10px] text-pos-text-muted line-clamp-2 mt-1 leading-relaxed font-medium">
                    {drink.description}
                  </p>
                )}
              </div>
              <div className="flex items-center justify-between mt-4">
                <span className="text-[9px] font-black uppercase tracking-tighter text-pos-text-muted bg-pos-bg/80 px-2.5 py-1 rounded-full border border-pos-border/50">
                  {drink.category.replace("_", " ")}
                </span>
                <span className="text-pos-accent font-black text-sm tabular-nums">
                  ${drink.actualPrice.toFixed(2)}
                </span>
              </div>
            </div>
            
            {/* Subtle background decoration */}
            <div className="absolute top-0 right-0 -mr-4 -mt-4 w-16 h-16 bg-pos-accent opacity-[0.03] rounded-full group-hover:opacity-[0.08] transition-opacity" />
          </button>
        ))}
      </div>

      {selectedDrink && (
        <ModifierModal 
          drink={selectedDrink} 
          onClose={() => setSelectedDrink(null)} 
          onConfirm={(modifiers) => handleAddOrder(selectedDrink, modifiers)}
        />
      )}
    </div>
  );
}
