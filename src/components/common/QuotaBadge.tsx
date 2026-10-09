import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { Sparkles, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const QuotaBadge: React.FC<{ onUpgradeClick?: () => void }> = ({ onUpgradeClick }) => {
  const { credits } = useAuthStore();
  const totalAvailable = credits.daily_free_remaining + credits.balance;

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-[#0D111A] border border-white/10 shadow-sm">
      <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
        <Sparkles className="w-4 h-4" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-slate-400 font-medium">Credits Quota</span>
          <span className="font-bold text-white font-mono">{totalAvailable} left</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, (totalAvailable / 15) * 100)}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-1 text-[10px] text-slate-500">
          <span>{credits.daily_free_remaining} daily free</span>
          <span>{credits.balance} pack credits</span>
        </div>
      </div>

      {onUpgradeClick ? (
        <button
          onClick={onUpgradeClick}
          className="px-2.5 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-medium flex items-center gap-1 transition"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Add</span>
        </button>
      ) : (
        <Link
          to="/app/billing"
          className="px-2.5 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-medium flex items-center gap-1 transition"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Add</span>
        </Link>
      )}
    </div>
  );
};
