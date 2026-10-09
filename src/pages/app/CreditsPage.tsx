import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { PaymentModal } from '../../components/common/PaymentModal';
import { Coins, Sparkles, Plus, Clock } from 'lucide-react';

export const CreditsPage: React.FC = () => {
  const { credits } = useAuthStore();
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  const totalQuota = credits.daily_free_remaining + credits.balance;

  return (
    <div className="p-6 sm:p-10 space-y-8 max-w-7xl mx-auto w-full">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-cyan-400 font-semibold uppercase tracking-wider">
              Quota & Top-Ups
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">
            Credits & Usage Allowance
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Each background removal utilizes 1 credit. Daily free credits reset automatically every 24 hours.
          </p>
        </div>

        <button
          onClick={() => setPaymentModalOpen(true)}
          className="btn-gradient-neon px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Buy Credit Packs</span>
        </button>
      </div>

      {/* Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        
        {/* Total Usable */}
        <div className="p-6 rounded-2xl bg-[#0D111A] border-2 border-cyan-400 shadow-[0_0_30px_rgba(0,242,254,0.15)] flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-slate-400">Total Credits Available</span>
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-4xl font-extrabold text-white font-mono my-2">{totalQuota}</p>
            <p className="text-xs text-slate-400">Ready to use immediately</p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 text-[11px] text-cyan-300">
            Auto-consumed on next upload
          </div>
        </div>

        {/* Daily Free Pool */}
        <div className="p-6 rounded-2xl bg-[#0D111A] border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-slate-400">Daily Free Quota</span>
              <Clock className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-4xl font-extrabold text-emerald-400 font-mono my-2">
              {credits.daily_free_remaining} <span className="text-lg text-slate-500 font-normal">/ 5</span>
            </p>
            <p className="text-xs text-slate-400">Refills to 5 every day at midnight</p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 text-[11px] text-slate-500 flex items-center gap-1">
            <span>Reset Cycle: 24-hour UTC schedule</span>
          </div>
        </div>

        {/* Purchased Balance */}
        <div className="p-6 rounded-2xl bg-[#0D111A] border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-slate-400">Purchased Pack Balance</span>
              <Coins className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-4xl font-extrabold text-purple-400 font-mono my-2">{credits.balance}</p>
            <p className="text-xs text-slate-400">Never expires</p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 text-[11px] text-slate-500">
            Used when daily free quota is empty
          </div>
        </div>

      </div>

      {/* Credit Pack Quick Options */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#0D111A] border border-white/10 space-y-6">
        <div>
          <h3 className="text-lg font-bold text-white font-['Outfit']">Need more capacity? Top up instantly</h3>
          <p className="text-xs text-slate-400 mt-1">Pack credits roll over forever with zero expiration dates.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl bg-[#07090e] border border-white/10 flex flex-col justify-between">
            <div>
              <p className="text-sm font-bold text-white">Starter 50</p>
              <p className="text-2xl font-bold text-cyan-400 font-mono my-2">50 Credits</p>
              <p className="text-xs text-slate-400 mb-4">₹7.98 / image</p>
            </div>
            <button
              onClick={() => setPaymentModalOpen(true)}
              className="w-full py-2 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-bold text-white transition"
            >
              Get for ₹399
            </button>
          </div>

          <div className="p-5 rounded-xl bg-[#07090e] border-2 border-purple-500/50 flex flex-col justify-between shadow-[0_0_20px_rgba(139,92,246,0.1)]">
            <div>
              <p className="text-sm font-bold text-white">Power 200</p>
              <p className="text-2xl font-bold text-purple-400 font-mono my-2">200 Credits</p>
              <p className="text-xs text-slate-400 mb-4">₹4.99 / image</p>
            </div>
            <button
              onClick={() => setPaymentModalOpen(true)}
              className="btn-gradient-neon w-full py-2 rounded-lg text-xs font-bold"
            >
              Get for ₹999
            </button>
          </div>

          <div className="p-5 rounded-xl bg-[#07090e] border border-white/10 flex flex-col justify-between">
            <div>
              <p className="text-sm font-bold text-white">Mega 1000</p>
              <p className="text-2xl font-bold text-pink-400 font-mono my-2">1,000 Credits</p>
              <p className="text-xs text-slate-400 mb-4">₹3.49 / image</p>
            </div>
            <button
              onClick={() => setPaymentModalOpen(true)}
              className="w-full py-2 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-bold text-white transition"
            >
              Get for ₹3,499
            </button>
          </div>
        </div>
      </div>

      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        defaultPlan="credit_pack"
      />

    </div>
  );
};
