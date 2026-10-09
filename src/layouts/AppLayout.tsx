import React, { useState } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { Logo } from '../components/common/Logo';
import { useAuthStore } from '../store/authStore';
import { PaymentModal } from '../components/common/PaymentModal';
import {
  LayoutDashboard,
  Upload,
  Download,
  CreditCard,
  Coins,
  Key,
  Settings,
  ShieldAlert,
  LogOut,
  Menu,
  X,
  Plus,
  Zap
} from 'lucide-react';

export const AppLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, credits, signOut, isAdmin } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  const isCurrent = (path: string) => location.pathname === path;

  const navigation = [
    { name: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard },
    { name: 'Workspace (Upload)', path: '/app/upload', icon: Upload, highlight: true },
    { name: 'Downloads & 24h History', path: '/app/downloads', icon: Download },
    { name: 'Credits & Quota', path: '/app/credits', icon: Coins },
    { name: 'Billing & Plans', path: '/app/billing', icon: CreditCard },
    { name: 'API Keys', path: '/app/api-keys', icon: Key },
    { name: 'Settings', path: '/app/settings', icon: Settings },
  ];

  const totalQuota = credits.daily_free_remaining + credits.balance;

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col md:flex-row">
      
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#0D111A] border-b border-white/10 sticky top-0 z-40">
        <Logo size="sm" linkTo="/app/dashboard" />
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPaymentModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono"
          >
            <Zap className="w-3 h-3 text-cyan-400" />
            <span>{totalQuota}</span>
          </button>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-300"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Desktop & Mobile Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 md:z-30 h-screen w-64 bg-[#0D111A] border-r border-white/5 flex flex-col justify-between transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top Section */}
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <Logo size="md" linkTo="/app/dashboard" />
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-1.5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Profile Mini Card */}
          <div className="p-3 rounded-xl bg-[#07090e] border border-white/5 flex items-center gap-3">
            <img
              src={user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
              alt="Avatar"
              className="w-9 h-9 rounded-full object-cover border border-cyan-400/40"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{user?.full_name || 'Creator'}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] text-cyan-300 uppercase font-mono font-bold tracking-wider">
                  {user?.plan || 'Free'} Plan
                </span>
              </div>
            </div>
          </div>

          {/* Quota Gauge */}
          <div className="p-3.5 rounded-xl bg-gradient-to-b from-cyan-950/40 to-transparent border border-cyan-500/20">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-400 font-medium">Daily Quota</span>
              <span className="font-mono font-bold text-cyan-300">{totalQuota} left</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden mb-2">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full"
                style={{ width: `${Math.min(100, (totalQuota / 15) * 100)}%` }}
              />
            </div>
            <button
              onClick={() => setPaymentModalOpen(true)}
              className="w-full py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Get More Credits</span>
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isCurrent(item.path);
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                    active
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-[0_0_15px_rgba(0,242,254,0.15)]'
                      : item.highlight
                      ? 'text-white bg-white/5 hover:bg-white/10'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="p-6 border-t border-white/5 space-y-2">
          {isAdmin && (
            <Link
              to="/admin/dashboard"
              className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-purple-300 bg-purple-500/10 border border-purple-500/30 hover:bg-purple-500/20 transition"
            >
              <ShieldAlert className="w-4 h-4 text-purple-400" />
              <span>Admin Portal</span>
            </Link>
          )}

          <button
            onClick={() => {
              signOut();
              navigate('/login');
            }}
            className="flex items-center gap-3 w-full px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

      </aside>

      {/* Main App Content Viewport */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Outlet />
      </main>

      {/* Razorpay Payment Modal */}
      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
      />

    </div>
  );
};
