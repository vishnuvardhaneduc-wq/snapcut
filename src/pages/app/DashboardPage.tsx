import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { formatBytes, formatTimeRemaining } from '../../lib/utils';
import { PaymentModal } from '../../components/common/PaymentModal';
import { DownloadQualityModal } from '../../components/common/DownloadQualityModal';
import {
  Sparkles,
  Upload,
  Download,
  Zap,
  Clock,
  ShieldCheck,
  TrendingUp,
  Image as ImageIcon,
  ArrowRight,
  Plus
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user, credits } = useAuthStore();
  const { history } = useWorkspaceStore();
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [qualityModalOpen, setQualityModalOpen] = useState(false);
  const [qualityDownload, setQualityDownload] = useState<{ url: string; filename: string } | null>(null);

  const totalQuota = credits.daily_free_remaining + credits.balance;

  return (
    <div className="p-6 sm:p-10 space-y-8 max-w-7xl mx-auto w-full">
      
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-cyan-400 font-semibold uppercase tracking-wider">
              {user?.plan || 'Free'} Plan Workspace
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-['Outfit']">
            Welcome, {user?.full_name || 'Creator'} 👋
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Remove backgrounds with hair-level precision in under 3 seconds.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setPaymentModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4 text-purple-400" />
            <span>Add Credits</span>
          </button>

          <Link
            to="/app/upload"
            className="btn-gradient-primary px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            <span>New Cutout</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Remaining Credits */}
        <div className="p-5 rounded-2xl bg-[#0D111A] border border-cyan-500/30 shadow-[0_0_20px_rgba(0,242,254,0.08)] flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Remaining Credits</span>
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono">{totalQuota}</span>
            <span className="text-xs text-slate-500">available</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
            <span>{credits.daily_free_remaining} daily free</span>
            <span>{credits.balance} pack credits</span>
          </div>
        </div>

        {/* Metric 2: Processed Today */}
        <div className="p-5 rounded-2xl bg-[#0D111A] border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Processed Today</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono">{5 - credits.daily_free_remaining}</span>
            <span className="text-xs text-emerald-400 font-medium">/ 5 daily free limit</span>
          </div>
          <div className="mt-3 text-[11px] text-slate-500 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Resets at 00:00 UTC</span>
          </div>
        </div>

        {/* Metric 3: Total Cutouts History */}
        <div className="p-5 rounded-2xl bg-[#0D111A] border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Total Images</span>
            <ImageIcon className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono">{history.length + 18}</span>
            <span className="text-xs text-slate-400">cutouts</span>
          </div>
          <div className="mt-3 text-[11px] text-slate-500 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Avg speed: 1.1s</span>
          </div>
        </div>

        {/* Metric 4: Temporary Storage Health */}
        <div className="p-5 rounded-2xl bg-[#0D111A] border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>24h Ephemeral Privacy</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-400 font-mono">100%</span>
            <span className="text-xs text-slate-400">Auto-Purge</span>
          </div>
          <div className="mt-3 text-[11px] text-slate-500">
            <span>Zero permanent files stored</span>
          </div>
        </div>

      </div>

      {/* Workspace Quick Launch Highlight */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-[#0D111A] to-purple-950/40 border border-cyan-500/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_0_30px_rgba(0,242,254,0.1)]">
        <div className="space-y-2 text-center md:text-left">
          <h3 className="text-xl font-bold text-white font-['Outfit'] flex items-center justify-center md:justify-start gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <span>Ready for your next background cutout?</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Drop high-res portraits, e-commerce products, or design assets into the workspace for instant 3-second transparent PNG export.
          </p>
        </div>
        <Link
          to="/app/upload"
          className="btn-gradient-primary px-6 py-3 rounded-xl text-xs font-bold whitespace-nowrap shadow-lg"
        >
          Open Upload Workspace
        </Link>
      </div>

      {/* Recent 24h Downloads & Uploads Table */}
      <div className="p-6 rounded-2xl bg-[#0D111A] border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white font-['Outfit']">Recent Cutouts (24h Ephemeral)</h3>
            <p className="text-xs text-slate-400">Files expire automatically after 24 hours</p>
          </div>
          <Link to="/app/downloads" className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/5 text-slate-500 font-mono">
                <th className="pb-3 font-medium">Image Preview</th>
                <th className="pb-3 font-medium">Filename</th>
                <th className="pb-3 font-medium">Size / Res</th>
                <th className="pb-3 font-medium">Expires In</th>
                <th className="pb-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {history.slice(0, 4).map((item) => (
                <tr key={item.id} className="hover:bg-white/[0.02] transition">
                  <td className="py-3">
                    <div className="w-12 h-12 rounded-lg checkerboard-pattern overflow-hidden border border-white/10">
                      <img
                        src={item.processed_url || item.original_url}
                        alt={item.original_filename}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </td>
                  <td className="py-3 font-medium text-white max-w-[180px] truncate">
                    {item.original_filename}
                  </td>
                  <td className="py-3 text-slate-400 font-mono">
                    {formatBytes(item.file_size_bytes)} • {item.width || 1920}×{item.height || 1080}
                  </td>
                  <td className="py-3 font-mono text-cyan-400">
                    {formatTimeRemaining(item.expires_at)}
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => {
                        setQualityDownload({
                          url: item.processed_url || item.original_url,
                          filename: item.original_filename,
                        });
                        setQualityModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-medium inline-flex items-center gap-1.5 transition"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PNG</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
      />

      <DownloadQualityModal
        isOpen={qualityModalOpen}
        onClose={() => {
          setQualityModalOpen(false);
          setQualityDownload(null);
        }}
        imageUrl={qualityDownload?.url || null}
        baseFilename={qualityDownload?.filename}
      />

    </div>
  );
};
