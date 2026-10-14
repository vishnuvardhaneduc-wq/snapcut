import React, { useState, useEffect } from 'react';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { formatBytes, formatTimeRemaining, downloadImage } from '../../lib/utils';
import { Download, Trash2, Clock, ShieldCheck, Search, Loader2, RefreshCw } from 'lucide-react';

export const DownloadsHistoryPage: React.FC = () => {
  const { history, historyLoading, loadHistory, removeFromHistory } = useWorkspaceStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [, setTick] = useState(0);

  useEffect(() => {
    loadHistory();
    // Refresh countdown every 30 seconds
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 30000);
    return () => clearInterval(interval);
  }, [loadHistory]);

  const activeHistory = history.filter(
    (item) => new Date(item.expires_at).getTime() > Date.now()
  );

  const filtered = activeHistory.filter((item) =>
    item.original_filename.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownload = async (item: (typeof history)[0]) => {
    setDownloadingId(item.id);
    try {
      await downloadImage(item.processed_url || item.original_url, item.original_filename);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="p-6 sm:p-10 space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-cyan-400 font-semibold uppercase tracking-wider">
              24-Hour Ephemeral Cache
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">
            Downloads & Recent Results
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Processed images are held in high-speed cloud storage for 24 hours before automatic purging.
          </p>
        </div>

        {/* Search & Refresh */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search cutouts..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#0D111A] border border-white/10 focus:border-cyan-400 focus:outline-none text-xs text-white transition"
            />
          </div>
          <button
            onClick={() => loadHistory()}
            disabled={historyLoading}
            title="Refresh list"
            className="p-2.5 rounded-xl bg-[#0D111A] border border-white/10 hover:border-cyan-400 text-slate-400 hover:text-white transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${historyLoading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Auto-Purge Privacy Banner */}
      <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20 flex items-center justify-between gap-4 text-xs text-slate-300">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0" />
          <span>
            <strong className="text-white">Zero Permanent Archival:</strong> Files shown here are automatically deleted once their 24h countdown expires.
          </span>
        </div>
        <span className="hidden sm:inline font-mono text-cyan-300 font-bold">
          {activeHistory.length} active files
        </span>
      </div>

      {/* Loading State */}
      {historyLoading && activeHistory.length === 0 ? (
        <div className="p-16 rounded-2xl bg-[#0D111A] border border-white/5 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading your recent cutouts from Supabase...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-16 rounded-2xl bg-[#0D111A] border border-white/5 text-center space-y-3">
          <Clock className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white font-['Outfit']">No Active Cutouts Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchTerm
              ? 'No active files matched your search.'
              : 'Upload photos in the workspace to remove their background. Processed images will appear here for 24 hours.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl bg-[#0D111A] border border-white/10 overflow-hidden hover:border-cyan-500/40 transition flex flex-col justify-between group shadow-sm hover:shadow-[0_0_25px_rgba(0,242,254,0.12)]"
            >
              {/* Preview with checkerboard background */}
              <div className="relative aspect-[4/3] checkerboard-pattern overflow-hidden border-b border-white/5">
                <img
                  src={item.processed_url || item.original_url}
                  alt={item.original_filename}
                  className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md border border-white/10 text-[10px] font-mono text-cyan-300 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-cyan-400" />
                  <span>{formatTimeRemaining(item.expires_at)}</span>
                </span>
                {item.source === 'api' && (
                  <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-[9px] font-mono text-purple-300">
                    API
                  </span>
                )}
              </div>

              {/* Info Body */}
              <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white truncate" title={item.original_filename}>
                    {item.original_filename}
                  </h4>
                  <div className="flex items-center justify-between text-xs text-slate-400 mt-2 font-mono">
                    <span>{formatBytes(item.file_size_bytes)}</span>
                    <span>{item.width || 1920}×{item.height || 1080}px</span>
                    <span className="text-cyan-400 font-semibold">{item.processing_time_ms || 980}ms</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                  <button
                    onClick={() => handleDownload(item)}
                    disabled={downloadingId === item.id}
                    className="btn-gradient-primary flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {downloadingId === item.id ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Downloading...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5" />
                        <span>Download PNG</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => removeFromHistory(item.id)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 border border-white/10 transition"
                    title="Delete Immediately"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
