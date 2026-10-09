import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { Logo } from '../components/common/Logo';
import { useAuthStore } from '../store/authStore';
import {
  ShieldAlert,
  Users,
  BarChart3,
  Terminal,
  CreditCard,
  ArrowLeft,
  Activity,
  Menu,
  X,
  Lock
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const { user } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isCurrent = (path: string) => location.pathname === path;

  const adminNav = [
    { name: 'Admin Overview', path: '/admin/dashboard', icon: Activity },
    { name: 'User Management', path: '/admin/users', icon: Users },
    { name: 'Platform Analytics', path: '/admin/analytics', icon: BarChart3 },
    { name: 'Webhook & Error Logs', path: '/admin/logs', icon: Terminal },
    { name: 'Razorpay Payments', path: '/admin/payments', icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-[#06080D] text-slate-100 flex flex-col md:flex-row">
      
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#0B0E17] border-b border-purple-500/20 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-purple-400" />
          <span className="text-xs font-mono font-bold text-purple-300">ADMIN CONTROL</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-300"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Admin Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 md:z-30 h-screen w-64 bg-[#0A0D15] border-r border-purple-500/20 flex flex-col justify-between transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <Logo size="sm" linkTo="/admin/dashboard" />
            <span className="px-2 py-0.5 rounded bg-purple-500/20 border border-purple-500/40 text-purple-300 text-[10px] font-mono font-bold uppercase">
              Admin
            </span>
          </div>

          <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-xs text-purple-200 flex items-center gap-2">
            <Lock className="w-4 h-4 text-purple-400 shrink-0" />
            <span className="truncate">Admin: {user?.email}</span>
          </div>

          <nav className="space-y-1">
            {adminNav.map((item) => {
              const Icon = item.icon;
              const active = isCurrent(item.path);
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                    active
                      ? 'bg-purple-500/20 text-purple-200 border border-purple-500/40 shadow-[0_0_15px_rgba(139,92,246,0.2)]'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-purple-400' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-6 border-t border-white/5">
          <Link
            to="/app/dashboard"
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-cyan-400 hover:bg-white/5 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to User App</span>
          </Link>
        </div>
      </aside>

      {/* Main Admin Viewport */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Outlet />
      </main>

    </div>
  );
};
