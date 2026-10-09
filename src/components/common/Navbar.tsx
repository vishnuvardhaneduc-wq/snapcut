import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Logo } from './Logo';
import { useAuthStore } from '../../store/authStore';
import { Sparkles, Menu, X, ArrowRight, ShieldAlert, LogOut } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, credits, signOut, isAdmin } = useAuthStore();

  const isCurrent = (path: string) => location.pathname === path;

  const navLinks = [
    { name: 'Features', path: '/features' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'API Docs', path: '/api-docs' },
    { name: 'Blog', path: '/blog' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#07090e]/80 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Logo */}
        <Logo size="md" />

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`text-sm font-medium transition-colors hover:text-cyan-400 ${
                isCurrent(link.path) ? 'text-cyan-400 font-semibold drop-shadow-[0_0_8px_rgba(0,242,254,0.5)]' : 'text-slate-300'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Action Buttons / Auth State */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              {/* Daily Quota badge */}
              <Link
                to="/app/credits"
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#131823] border border-cyan-500/30 text-xs font-medium text-slate-200 hover:border-cyan-400 transition"
              >
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span>{credits.daily_free_remaining + credits.balance} credits left</span>
              </Link>

              {/* App Workspace Button */}
              <Link
                to="/app/upload"
                className="btn-gradient-primary px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Workspace</span>
              </Link>

              {/* Admin Link if admin */}
              {isAdmin && (
                <Link
                  to="/admin/dashboard"
                  className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 hover:bg-purple-500/20 transition"
                  title="Admin Portal"
                >
                  <ShieldAlert className="w-4 h-4" />
                </Link>
              )}

              {/* Dashboard / User Dropdown */}
              <Link
                to="/app/dashboard"
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 text-xs font-medium text-slate-200 transition"
              >
                <img
                  src={user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                  alt="avatar"
                  className="w-6 h-6 rounded-full object-cover border border-cyan-400/50"
                />
                <span className="max-w-[100px] truncate">{user.full_name || 'Dashboard'}</span>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm font-medium text-slate-300 hover:text-white px-3 py-2 transition"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="btn-gradient-neon px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/10 bg-[#0D111A]/95 backdrop-blur-2xl px-6 py-6 space-y-4">
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`text-base font-medium py-1 ${
                  isCurrent(link.path) ? 'text-cyan-400' : 'text-slate-300'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
            {user ? (
              <>
                <Link
                  to="/app/upload"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-gradient-primary w-full py-2.5 rounded-xl text-center text-sm font-semibold flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Open Workspace</span>
                </Link>
                <Link
                  to="/app/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-center text-sm font-medium text-slate-200"
                >
                  User Dashboard
                </Link>
                <button
                  onClick={() => {
                    signOut();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 text-xs text-rose-400 hover:text-rose-300 flex items-center justify-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-center text-sm font-medium text-slate-200"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-gradient-neon w-full py-2.5 rounded-xl text-center text-sm font-semibold"
                >
                  Get Started Free
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
