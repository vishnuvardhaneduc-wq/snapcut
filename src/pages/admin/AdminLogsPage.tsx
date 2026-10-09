import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';

interface SystemLog {
  id: string;
  time: string;
  eventType: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  ip: string;
}

export const AdminLogsPage: React.FC = () => {
  const [logs] = useState<SystemLog[]>([
    { id: 'log_9812', time: '14:32:10', eventType: 'api_processing', severity: 'info', message: 'Cutout completed successfully (1.12s) for key sc_live_9fa821', ip: '157.240.241.35' },
    { id: 'log_9811', time: '14:30:05', eventType: 'razorpay_webhook', severity: 'info', message: 'Verified payment signature for order_9812491, upgraded user usr_2 to pro', ip: '52.74.223.119' },
    { id: 'log_9810', time: '14:24:51', eventType: 'file_validation', severity: 'warning', message: 'Rejected file 14MB exceeds 10MB maximum limit', ip: '103.21.244.2' },
    { id: 'log_9809', time: '14:00:00', eventType: 'cron_cleanup', severity: 'info', message: 'Cron purged 142 expired assets older than 24 hours from Cloudinary', ip: 'internal_worker' },
    { id: 'log_9808', time: '13:48:19', eventType: 'rate_limit', severity: 'error', message: 'Rate limit 429 triggered: IP exceeded 60 requests/minute', ip: '185.220.101.5' },
  ]);

  const [filter, setFilter] = useState<'all' | 'error' | 'info'>('all');

  const filtered = logs.filter((l) => {
    if (filter === 'error') return l.severity === 'error' || l.severity === 'critical';
    if (filter === 'info') return l.severity === 'info';
    return true;
  });

  return (
    <div className="p-6 sm:p-10 space-y-6 max-w-7xl mx-auto w-full">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">
            System & Webhook Audit Logs
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time telemetry from edge triggers, Supabase RLS events, and API calls.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition ${filter === 'all' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' : 'bg-white/5 text-slate-400'}`}
          >
            All Logs
          </button>
          <button
            onClick={() => setFilter('error')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition ${filter === 'error' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-white/5 text-slate-400'}`}
          >
            Errors Only
          </button>
          <button
            onClick={() => alert('Logs refreshed from Supabase logs table')}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300"
            title="Refresh Logs"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-[#0D111A] border border-white/10 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-white/5 text-slate-500">
                <th className="pb-3 font-medium">Time (UTC)</th>
                <th className="pb-3 font-medium">Event Type</th>
                <th className="pb-3 font-medium">Severity</th>
                <th className="pb-3 font-medium">Message Details</th>
                <th className="pb-3 font-medium text-right">Caller IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((l) => (
                <tr key={l.id} className="hover:bg-white/[0.02] transition">
                  <td className="py-3 text-slate-400">{l.time}</td>
                  <td className="py-3 text-cyan-300 font-bold">{l.eventType}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      l.severity === 'error' || l.severity === 'critical'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        : l.severity === 'warning'
                        ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      {l.severity}
                    </span>
                  </td>
                  <td className="py-3 text-slate-300 max-w-md truncate">{l.message}</td>
                  <td className="py-3 text-right text-slate-500">{l.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
