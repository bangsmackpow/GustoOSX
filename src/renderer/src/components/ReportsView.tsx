import { useState, useEffect } from "react";
import { useStore } from "../store";
import { BarChart3, Download, Printer, TrendingUp, DollarSign, Receipt, CreditCard, Banknote, Users } from "lucide-react";

export function ReportsView() {
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = async () => {
    setLoading(true);
    try {
      // Get closed tabs for today
      const tabsResult = await window.api.db.query(
        "SELECT t.*, u.first_name, u.last_name FROM tabs t JOIN users u ON t.staff_user_id = u.id WHERE t.status = 'closed' AND t.closed_at >= unixepoch('now', 'start of day')",
        []
      );

      if (tabsResult.success) {
        const tabs = tabsResult.data;
        const totalSales = tabs.reduce((sum: number, t: any) => sum + t.total_amount, 0);
        const cashSales = tabs.filter((t: any) => t.payment_method === 'cash').reduce((sum: number, t: any) => sum + t.total_amount, 0);
        const cardSales = tabs.filter((t: any) => t.payment_method === 'card').reduce((sum: number, t: any) => sum + t.total_amount, 0);
        
        // Staff breakdown
        const staffSales: Record<string, { name: string, total: number, count: number }> = {};
        tabs.forEach((t: any) => {
          const name = `${t.first_name} ${t.last_name}`;
          if (!staffSales[t.staff_user_id]) {
            staffSales[t.staff_user_id] = { name, total: 0, count: 0 };
          }
          staffSales[t.staff_user_id].total += t.total_amount;
          staffSales[t.staff_user_id].count += 1;
        });

        // Get item breakdown
        const ordersResult = await window.api.db.query(
          `SELECT drink_name, SUM(quantity) as total_qty, SUM(quantity * unit_price) as total_rev 
           FROM orders 
           WHERE tab_id IN (SELECT id FROM tabs WHERE status = 'closed' AND closed_at >= unixepoch('now', 'start of day'))
           AND voided = 0
           GROUP BY drink_name
           ORDER BY total_rev DESC`,
          []
        );

        setReportData({
          totalSales,
          cashSales,
          cardSales,
          tabCount: tabs.length,
          staff: Object.values(staffSales),
          items: ordersResult.success ? ordersResult.data : []
        });
      }
    } catch (err) {
      console.error("Failed to load report:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrintZReport = async () => {
    if (!reportData) return;
    const lines = [
      "******* Z-REPORT *******",
      `Date: ${new Date().toLocaleDateString()}`,
      `Time: ${new Date().toLocaleTimeString()}`,
      "--------------------------------",
      `Total Sales:   $${reportData.totalSales.toFixed(2)}`,
      `Cash:          $${reportData.cashSales.toFixed(2)}`,
      `Card:          $${reportData.cardSales.toFixed(2)}`,
      `Total Tabs:    ${reportData.tabCount}`,
      "--------------------------------",
      "STAFF BREAKDOWN:",
      ...reportData.staff.map((s: any) => 
        `${s.name.padEnd(15)} $${s.total.toFixed(2)} (${s.count})`
      ),
      "--------------------------------",
      "TOP ITEMS:",
      ...reportData.items.slice(0, 5).map((i: any) => 
        `${i.total_qty}x ${i.drink_name.padEnd(15)} $${i.total_rev.toFixed(2)}`
      ),
      "--------------------------------",
      "   END OF SHIFT REPORT   ",
      "************************",
    ];
    await window.api.printer.printReceipt(lines);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <BarChart3 className="w-8 h-8 text-pos-accent animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-pos-bg">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter">Shift Audit</h1>
            <p className="text-pos-text-muted text-sm mt-1">Full breakdown of today's operational performance</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={loadReport}
              className="bg-pos-surface border border-pos-border text-pos-text px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:border-pos-accent transition-all"
            >
              Refresh
            </button>
            <button 
              onClick={handlePrintZReport}
              className="bg-pos-accent text-black px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Print Z-Report
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Sales" value={`$${reportData?.totalSales.toFixed(2)}`} icon={DollarSign} color="text-pos-accent" />
          <StatCard title="Cash" value={`$${reportData?.cashSales.toFixed(2)}`} icon={Banknote} color="text-pos-success" />
          <StatCard title="Card" value={`$${reportData?.cardSales.toFixed(2)}`} icon={CreditCard} color="text-blue-400" />
          <StatCard title="Total Tabs" value={reportData?.tabCount.toString()} icon={Receipt} color="text-pos-text" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Item Breakdown */}
          <div className="lg:col-span-2 bg-pos-surface border border-pos-border rounded-[2.5rem] overflow-hidden shadow-xl">
            <div className="p-6 border-b border-pos-border flex items-center justify-between bg-pos-surface-hover/30">
              <h2 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-pos-accent" />
                Item Sales
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] uppercase font-black text-pos-text-muted border-b border-pos-border">
                    <th className="px-6 py-4">Item Name</th>
                    <th className="px-6 py-4 text-right">Qty</th>
                    <th className="px-6 py-4 text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pos-border/50">
                  {reportData?.items.map((item: any, idx: number) => (
                    <tr key={idx} className="hover:bg-pos-surface-hover/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-bold uppercase tracking-tight">{item.drink_name}</td>
                      <td className="px-6 py-4 text-sm text-right tabular-nums">{item.total_qty}</td>
                      <td className="px-6 py-4 text-sm text-right font-black text-pos-accent tabular-nums">${item.total_rev.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Staff Breakdown */}
          <div className="bg-pos-surface border border-pos-border rounded-[2.5rem] overflow-hidden shadow-xl">
            <div className="p-6 border-b border-pos-border flex items-center justify-between bg-pos-surface-hover/30">
              <h2 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                <Users className="w-4 h-4 text-pos-accent" />
                Staff Performance
              </h2>
            </div>
            <div className="p-6 space-y-4">
              {reportData?.staff.map((s: any, idx: number) => (
                <div key={idx} className="bg-pos-bg rounded-2xl p-4 border border-pos-border">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-black uppercase tracking-tight">{s.name}</p>
                      <p className="text-[10px] text-pos-text-muted uppercase font-bold mt-1">{s.count} tabs closed</p>
                    </div>
                    <p className="text-sm font-black text-pos-accent">${s.total.toFixed(2)}</p>
                  </div>
                  <div className="mt-3 w-full bg-pos-surface h-1 rounded-full overflow-hidden">
                    <div 
                      className="bg-pos-accent h-full" 
                      style={{ width: `${(s.total / reportData.totalSales) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
              {reportData?.staff.length === 0 && (
                <p className="text-center text-pos-text-muted italic text-sm py-8">No staff activity today.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: { title: string, value: string, icon: any, color: string }) {
  return (
    <div className="bg-pos-surface border border-pos-border p-6 rounded-[2rem] shadow-sm hover:border-pos-accent/30 transition-all group">
      <div className="flex items-start justify-between">
        <div className="bg-pos-bg p-3 rounded-2xl border border-pos-border group-hover:border-pos-accent/20 transition-all">
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
      <div className="mt-4">
        <p className="text-[10px] uppercase font-black text-pos-text-muted tracking-widest">{title}</p>
        <p className={`text-2xl font-black mt-1 ${color}`}>{value}</p>
      </div>
    </div>
  );
}
