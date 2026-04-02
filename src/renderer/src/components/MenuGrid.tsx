import { useStore, Drink } from "../store";

interface MenuGridProps {
  drinks: Drink[];
}

export function MenuGrid({ drinks }: MenuGridProps) {
  const { addOrder, currentTabId } = useStore();

  const handleAddDrink = async (drink: Drink) => {
    if (!currentTabId) return;
    
    const newOrder = {
      id: crypto.randomUUID(),
      tabId: currentTabId,
      drinkId: drink.id,
      drinkName: drink.name,
      quantity: 1,
      unitPrice: drink.actualPrice,
      voided: false,
    };

    const result = await window.api.db.run(
      "INSERT INTO orders (id, tab_id, drink_id, drink_name, quantity, unit_price, voided, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [newOrder.id, newOrder.tabId, newOrder.drinkId, newOrder.drinkName, newOrder.quantity, newOrder.unitPrice, 0, Math.floor(Date.now() / 1000)]
    );

    if (result.success) {
      addOrder(newOrder);
    }
  };

  if (drinks.length === 0) {
    return (
      <div className="flex items-center justify-center flex-1 text-pos-text-muted">
        No items in this category
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {drinks.map((drink) => (
          <button
            key={drink.id}
            onClick={() => handleAddDrink(drink)}
            className="bg-pos-surface border border-pos-border rounded-xl p-4 text-left hover:border-pos-accent hover:bg-pos-surface-hover transition-all active:scale-[0.98] group"
          >
            <div className="flex flex-col gap-2 h-full justify-between">
              <div className="flex flex-col gap-1">
                <div className="flex items-start justify-between">
                  <h3 className="font-medium text-sm text-pos-text group-hover:text-pos-accent transition-colors leading-tight">
                    {drink.name}
                  </h3>
                </div>
                {drink.description && (
                  <p className="text-[11px] text-pos-text-muted line-clamp-2 mt-1 italic">
                    {drink.description}
                  </p>
                )}
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-pos-border/50">
                <span className="text-[10px] uppercase tracking-wider text-pos-text-muted bg-pos-bg px-2 py-0.5 rounded-full">
                  {drink.category.replace("_", " ")}
                </span>
                <span className="text-pos-accent font-bold text-sm">
                  ${drink.actualPrice.toFixed(2)}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
