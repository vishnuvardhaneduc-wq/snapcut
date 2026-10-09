import React, { useState } from 'react';
import { Search } from 'lucide-react';

interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  plan: 'free' | 'pro' | 'enterprise';
  credits: number;
  totalUploads: number;
  joined: string;
}

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<AdminUserRow[]>([
    { id: 'usr_1', name: 'Alex Rivera', email: 'creator@snapcut.ai', role: 'admin', plan: 'pro', credits: 15, totalUploads: 412, joined: '2026-08-10' },
    { id: 'usr_2', name: 'Sarah Connor', email: 'sarah@designco.com', role: 'user', plan: 'pro', credits: 120, totalUploads: 980, joined: '2026-08-22' },
    { id: 'usr_3', name: 'Devin Chen', email: 'devin@agency.io', role: 'user', plan: 'enterprise', credits: 840, totalUploads: 3410, joined: '2026-09-01' },
    { id: 'usr_4', name: 'Maya Lin', email: 'maya@portraitstudio.org', role: 'user', plan: 'free', credits: 5, totalUploads: 29, joined: '2026-10-02' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  const grantCredits = (userId: string) => {
    const amountStr = prompt('Enter number of bonus credits to grant to this user:', '50');
    if (!amountStr) return;
    const amount = parseInt(amountStr, 10);
    if (isNaN(amount)) return;

    setUsers(users.map((u) => u.id === userId ? { ...u, credits: u.credits + amount } : u));
    alert(`Granted ${amount} bonus credits!`);
  };

  const togglePlan = (userId: string) => {
    setUsers(users.map((u) => {
      if (u.id === userId) {
        const nextPlan = u.plan === 'free' ? 'pro' : u.plan === 'pro' ? 'enterprise' : 'free';
        return { ...u, plan: nextPlan };
      }
      return u;
    }));
  };

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 sm:p-10 space-y-6 max-w-7xl mx-auto w-full">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">
            User Accounts & Quotas
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Search users, adjust plan levels, and manually grant credit balances.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search email or name..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#0D111A] border border-white/10 focus:border-purple-400 focus:outline-none text-xs text-white transition"
          />
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-[#0D111A] border border-white/10 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/5 text-slate-500 font-mono">
                <th className="pb-3 font-medium">User Profile</th>
                <th className="pb-3 font-medium">Role</th>
                <th className="pb-3 font-medium">Plan</th>
                <th className="pb-3 font-medium">Usable Credits</th>
                <th className="pb-3 font-medium">Lifetime Uploads</th>
                <th className="pb-3 font-medium">Joined</th>
                <th className="pb-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-white/[0.02] transition">
                  <td className="py-3">
                    <div>
                      <p className="font-bold text-white">{u.name}</p>
                      <p className="text-slate-400 text-[11px] font-mono">{u.email}</p>
                    </div>
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded font-mono text-[10px] uppercase ${
                      u.role === 'admin' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' : 'bg-white/5 text-slate-400'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3">
                    <button
                      onClick={() => togglePlan(u.id)}
                      className="px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[11px] font-mono font-bold uppercase transition"
                      title="Click to cycle plan"
                    >
                      {u.plan}
                    </button>
                  </td>
                  <td className="py-3 font-mono font-bold text-white">{u.credits}</td>
                  <td className="py-3 font-mono text-purple-300">{u.totalUploads}</td>
                  <td className="py-3 text-slate-400">{u.joined}</td>
                  <td className="py-3 text-right space-x-2">
                    <button
                      onClick={() => grantCredits(u.id)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-medium transition"
                    >
                      + Credits
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
