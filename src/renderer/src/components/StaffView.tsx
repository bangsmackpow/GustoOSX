import { useState, useEffect } from "react";
import { useStore } from "../store";
import { Users, UserPlus, Shield, User, Key, Trash2, Edit2, Check, X } from "lucide-react";

interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "admin" | "manager" | "bartender" | "server";
  pin: string;
  isActive: boolean;
}

export function StaffView() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    pin: "",
    role: "bartender" as const
  });

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    setLoading(true);
    const result = await window.api.db.query("SELECT * FROM users ORDER BY role, first_name", []);
    if (result.success) {
      setStaff(result.data.map((u: any) => ({
        id: u.id,
        firstName: u.first_name,
        lastName: u.last_name,
        email: u.email,
        role: u.role,
        pin: u.pin,
        isActive: !!u.is_active
      })));
    }
    setLoading(false);
  };

  const handleAdd = async () => {
    const id = crypto.randomUUID();
    const result = await window.api.db.run(
      "INSERT INTO users (id, first_name, last_name, email, pin, role, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [id, formData.firstName, formData.lastName, formData.email, formData.pin, formData.role, 1]
    );

    if (result.success) {
      setShowAdd(false);
      setFormData({ firstName: "", lastName: "", email: "", pin: "", role: "bartender" });
      await loadStaff();
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    const result = await window.api.db.run("UPDATE users SET is_active = ? WHERE id = ?", [currentStatus ? 0 : 1, id]);
    if (result.success) await loadStaff();
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Users className="w-8 h-8 text-pos-accent animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-pos-bg">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter">Staff Directory</h1>
            <p className="text-pos-text-muted text-sm mt-1">Manage permissions, PINs, and active personnel</p>
          </div>
          <button 
            onClick={() => setShowAdd(true)}
            className="bg-pos-accent text-black px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2 shadow-lg shadow-pos-accent/20"
          >
            <UserPlus className="w-4 h-4" />
            Add Staff
          </button>
        </div>

        {showAdd && (
          <div className="bg-pos-surface border border-pos-accent/30 p-8 rounded-[2.5rem] shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-black uppercase tracking-widest text-pos-accent">New Staff Member</h2>
              <button onClick={() => setShowAdd(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Input label="First Name" value={formData.firstName} onChange={v => setFormData({...formData, firstName: v})} />
              <Input label="Last Name" value={formData.lastName} onChange={v => setFormData({...formData, lastName: v})} />
              <Input label="Email" value={formData.email} onChange={v => setFormData({...formData, email: v})} />
              <Input label="Access PIN" value={formData.pin} onChange={v => setFormData({...formData, pin: v})} type="password" />
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-pos-text-muted ml-1">Role</label>
                <select 
                  value={formData.role} 
                  onChange={e => setFormData({...formData, role: e.target.value as any})}
                  className="w-full bg-pos-bg border border-pos-border rounded-2xl px-5 py-4 text-sm focus:border-pos-accent focus:outline-none transition-all font-bold appearance-none"
                >
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="bartender">Bartender</option>
                  <option value="server">Server</option>
                </select>
              </div>
              <div className="flex items-end">
                <button 
                  onClick={handleAdd}
                  className="w-full bg-pos-accent text-black h-[54px] rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-pos-accent/20"
                >
                  Create Account
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {staff.map((member) => (
            <div 
              key={member.id} 
              className={`bg-pos-surface border p-6 rounded-[2.5rem] shadow-sm transition-all group ${
                member.isActive ? "border-pos-border hover:border-pos-accent/30" : "border-pos-danger/20 opacity-60"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className={`p-3 rounded-2xl ${member.role === 'admin' ? 'bg-pos-accent/10 text-pos-accent' : 'bg-pos-bg text-pos-text-muted'}`}>
                  {member.role === 'admin' ? <Shield className="w-6 h-6" /> : <User className="w-6 h-6" />}
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => toggleStatus(member.id, member.isActive)}
                    className={`p-2 rounded-xl border transition-all ${
                      member.isActive ? "border-pos-border hover:bg-pos-danger/10 hover:text-pos-danger" : "border-pos-success/30 bg-pos-success/10 text-pos-success"
                    }`}
                  >
                    {member.isActive ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-lg font-black uppercase tracking-tight">{member.firstName} {member.lastName}</p>
                <p className="text-[10px] text-pos-accent font-black uppercase tracking-widest mt-1">{member.role}</p>
                <div className="mt-4 flex items-center gap-4 border-t border-pos-border/50 pt-4">
                  <div className="flex items-center gap-2 text-pos-text-muted">
                    <Key className="w-3 h-3" />
                    <span className="text-[10px] font-bold tracking-widest uppercase">PIN: ****</span>
                  </div>
                  <div className="h-1 w-1 rounded-full bg-pos-border" />
                  <span className="text-[10px] font-bold text-pos-text-muted uppercase tracking-tight truncate">{member.email}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text" }: { label: string, value: string, onChange: (v: string) => void, type?: string }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-widest text-pos-text-muted ml-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-pos-bg border border-pos-border rounded-2xl px-5 py-4 text-sm focus:border-pos-accent focus:outline-none transition-all font-bold"
      />
    </div>
  );
}
