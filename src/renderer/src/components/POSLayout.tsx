import { useState, useEffect } from "react";
import { useStore } from "../store";
import { MenuGrid } from "./MenuGrid";
import { OrderPanel } from "./OrderPanel";
import { TabBar } from "./TabBar";
import { ReportsView } from "./ReportsView";
import { InventoryView } from "./InventoryView";
import { StaffView } from "./StaffView";
import { WindowControls } from "./WindowControls";
import { QuickSearch } from "./QuickSearch";
import {
  Wine,
  Beer,
  GlassWater,
  Coffee,
  Utensils,
  Settings,
  LogOut,
  Search,
  Package,
  BarChart3,
  Users,
  LayoutGrid
} from "lucide-react";

const categories = [
  { id: "all", label: "All", icon: LayoutGrid },
  { id: "cocktail", label: "Cocktails", icon: Wine },
  { id: "beer", label: "Beer", icon: Beer },
  { id: "wine", label: "Wine", icon: GlassWater },
  { id: "shot", label: "Shots", icon: Coffee },
  { id: "non_alcoholic", label: "Non-Alc", icon: GlassWater },
  { id: "food", label: "Food", icon: Utensils },
];

export function POSLayout() {
  const { 
    currentUser, 
    logout, 
    activeCategory, 
    setActiveCategory, 
    showQuickSearch, 
    toggleQuickSearch,
    activeView,
    setActiveView
  } = useStore();
  
  const [drinks, setDrinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDrinks();
  }, []);

  const loadDrinks = async () => {
    try {
      const result = await window.api.db.query(`
        SELECT d.*, 
        EXISTS (
          SELECT 1 FROM recipe_ingredients ri 
          JOIN ingredients i ON ri.ingredient_id = i.id 
          WHERE ri.drink_id = d.id AND i.current_stock <= i.minimum_stock
        ) as is_low_stock
        FROM drinks d 
        WHERE d.is_available = 1 
        ORDER BY d.category, d.name
      `, []);
      if (result.success) {
        setDrinks(result.data || []);
      }
    } catch (err) {
      console.error("Failed to load drinks:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredDrinks = activeCategory === "all"
    ? drinks
    : drinks.filter((d) => d.category === activeCategory);

  return (
    <div className="flex flex-col h-screen bg-pos-bg text-pos-text overflow-hidden select-none font-sans">
      {/* Title bar */}
      <div className="flex items-center justify-between h-12 bg-pos-surface border-b border-pos-border px-4 z-50 shadow-sm" style={{ WebkitAppRegion: "drag" } as any}>
        <div className="flex items-center gap-3">
          <div className="bg-pos-accent p-1 rounded-md">
            <Wine className="w-4 h-4 text-black" />
          </div>
          <span className="font-bold text-xs tracking-widest uppercase text-pos-accent">GustoOSX</span>
          <div className="h-4 w-px bg-pos-border mx-2" />
          {currentUser && (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-pos-success animate-pulse" />
              <span className="text-pos-text-muted text-[10px] uppercase font-bold tracking-wider">
                {currentUser.firstName} {currentUser.lastName}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1" style={{ WebkitAppRegion: "no-drag" } as any}>
          <WindowControls />
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Navigation Sidebar */}
        <div className="w-20 bg-pos-surface border-r border-pos-border flex flex-col items-center py-6 gap-6 z-40">
          <div className="flex flex-col gap-4">
            <NavIcon 
              icon={LayoutGrid} 
              active={activeView === "pos"} 
              onClick={() => setActiveView("pos")} 
              label="POS" 
            />
            <NavIcon 
              icon={Package} 
              active={activeView === "inventory"} 
              onClick={() => setActiveView("inventory")} 
              label="Inventory" 
            />
            <NavIcon 
              icon={BarChart3} 
              active={activeView === "reports"} 
              onClick={() => setActiveView("reports")} 
              label="Reports" 
            />
            <NavIcon 
              icon={Users} 
              active={activeView === "staff"} 
              onClick={() => setActiveView("staff")} 
              label="Staff" 
            />
          </div>

          <div className="flex-1" />

          <div className="flex flex-col gap-4 mb-2">
            <NavIcon 
              icon={Settings} 
              active={activeView === "settings"} 
              onClick={() => setActiveView("settings")} 
              label="Settings" 
            />
            <button
              onClick={logout}
              className="w-12 h-12 rounded-2xl flex flex-col items-center justify-center text-pos-danger hover:bg-pos-danger/10 transition-all group"
            >
              <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="text-[8px] uppercase font-bold mt-1">Logout</span>
            </button>
          </div>
        </div>

        {/* View Container */}
        <div className="flex-1 flex overflow-hidden">
          {activeView === "pos" ? (
            <>
              {/* Category Sidebar */}
              <div className="w-20 bg-pos-bg border-r border-pos-border/50 flex flex-col items-center py-6 gap-4 z-30 shadow-inner">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center transition-all group ${
                      activeCategory === cat.id 
                        ? "bg-pos-accent text-black shadow-lg shadow-pos-accent/20" 
                        : "text-pos-text-muted hover:bg-pos-surface hover:text-pos-text"
                    }`}
                  >
                    <cat.icon className={`w-5 h-5 transition-transform group-active:scale-90 ${activeCategory === cat.id ? "scale-110" : ""}`} />
                    <span className={`text-[8px] uppercase font-bold mt-1 ${activeCategory === cat.id ? "text-black" : "text-pos-text-muted"}`}>
                      {cat.label}
                    </span>
                  </button>
                ))}
              </div>

              {/* Menu & Tabs */}
              <div className="flex-1 flex flex-col overflow-hidden bg-pos-bg/50 relative">
                <div className="flex items-center gap-3 p-4 border-b border-pos-border/50 bg-pos-bg/80 backdrop-blur-md sticky top-0 z-20">
                  <button
                    onClick={toggleQuickSearch}
                    className="flex-1 flex items-center gap-3 bg-pos-surface border border-pos-border rounded-2xl px-5 py-3.5 text-pos-text-muted hover:border-pos-accent transition-all group shadow-sm hover:shadow-md"
                  >
                    <Search className="w-4 h-4 group-hover:text-pos-accent transition-colors" />
                    <span className="text-xs font-medium uppercase tracking-widest">Search menu (⌘K)</span>
                  </button>
                </div>

                <TabBar />

                <div className="flex-1 overflow-hidden relative">
                  {loading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="flex flex-col items-center gap-4">
                        <Wine className="w-8 h-8 text-pos-accent animate-bounce" />
                        <span className="text-pos-text-muted text-xs uppercase tracking-widest font-bold">Loading Menu...</span>
                      </div>
                    </div>
                  ) : (
                    <MenuGrid drinks={filteredDrinks} />
                  )}
                </div>
              </div>

              {/* Right Order Panel */}
              <OrderPanel />
            </>
          ) : activeView === "reports" ? (
            <ReportsView />
          ) : activeView === "inventory" ? (
            <InventoryView />
          ) : activeView === "staff" ? (
            <StaffView />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-pos-bg p-8">
              <div className="max-w-md w-full text-center space-y-6">
                <div className="bg-pos-surface p-12 rounded-3xl border border-pos-border shadow-2xl">
                  <Wine className="w-16 h-16 text-pos-accent mx-auto mb-6 opacity-20" />
                  <h2 className="text-2xl font-black uppercase tracking-tighter mb-2">{activeView} VIEW</h2>
                  <p className="text-pos-text-muted text-sm leading-relaxed">
                    This module is currently in development. GustoOSX is a local-first, highly optimized bar system.
                  </p>
                  <button 
                    onClick={() => setActiveView("pos")}
                    className="mt-8 bg-pos-accent text-black px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-pos-accent/20"
                  >
                    Return to POS
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick search overlay */}
      {showQuickSearch && <QuickSearch drinks={drinks} onClose={toggleQuickSearch} />}
    </div>
  );
}

function NavIcon({ icon: Icon, active, onClick, label }: { icon: any; active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center transition-all group ${
        active 
          ? "bg-pos-accent text-black shadow-lg shadow-pos-accent/20" 
          : "text-pos-text-muted hover:bg-pos-surface-hover hover:text-pos-text"
      }`}
    >
      <Icon className={`w-6 h-6 transition-all group-hover:scale-110 ${active ? "scale-105" : ""}`} />
      <span className={`text-[9px] uppercase font-black mt-1.5 tracking-tighter ${active ? "text-black" : "text-pos-text-muted"}`}>
        {label}
      </span>
    </button>
  );
}
