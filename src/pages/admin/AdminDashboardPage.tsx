import React from 'react';
import { Users, DollarSign, Image, Activity, TrendingUp } from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const stats = [
    { label: 'Total Registered Users', value: '42,890', change: '+12.4%', icon: Users, color: 'text-cyan-400' },
    { label: 'Total Images Processed', value: '1.24M', change: '+24.1%', icon: Image, color: 'text-purple-400' },
    { label: 'Monthly Recurring Revenue', value: '₹18,42,000', change: '+18.7%', icon: DollarSign, color: 'text-emerald-400' },
    { label: 'Active Pro Subscriptions', value: '1,894', change: '+8.3%', icon: Activity, color: 'text-pink-400' },
  ];

  const recentJobs = [
    { id: 'job_8921', user: 'sarah@designco.com', status: 'Completed', engine: 'Remove.bg API', latency: '1.12s', time: '2 mins ago' },
    { id: 'job_8920', user: 'devin@agency.io', status: 'Completed', engine: 'ClipDrop AI', latency: '0.94s', time: '5 mins ago' },
    { id: 'job_8919', user: 'alex@startup.dev', status: 'Completed', engine: 'Local Canvas AI', latency: '0.82s', time: '11 mins ago' },
    { id: 'job_8918', user: 'anonymous_api', status: 'Failed', engine: 'Cloud Edge Worker', latency: '12.4s', time: '18 mins ago', error: '413 Payload too large' },
  ];

  return (
    <div className="p-6 sm:p-10 space-y-8 max-w-7xl mx-auto w-full">
      
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono text-purple-400 font-semibold uppercase tracking-wider">
            System Operations
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
        </div>
        <h1 className="text-3xl font-extrabold text-white font-['Outfit']">
          Admin Metrics & Health Dashboard
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Real-time overview of edge workers, Supabase RLS logs, Razorpay revenue, and user quotas.
        </p>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-[#0D111A] border border-white/10 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>{s.label}</span>
                <Icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-white font-mono">{s.value}</span>
                <span className="text-xs font-mono text-emerald-400 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-0.5" />
                  {s.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* System Service Nodes Health */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-[#0D111A] border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Cloud Webhook & API Ingestion</span>
            <span className="text-emerald-400 font-mono font-bold">HEALTHY</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-400 w-full" />
          </div>
          <p className="text-[11px] text-slate-500">Latency: 42ms • Uptime: 99.99%</p>
        </div>

        <div className="p-5 rounded-xl bg-[#0D111A] border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Cloudinary 24h Lifecycle</span>
            <span className="text-emerald-400 font-mono font-bold">ACTIVE</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-cyan-400 w-full" />
          </div>
          <p className="text-[11px] text-slate-500">Auto-purge cron runs every 60 mins</p>
        </div>

        <div className="p-5 rounded-xl bg-[#0D111A] border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Razorpay Webhook Delivery</span>
            <span className="text-emerald-400 font-mono font-bold">100% SYNC</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-purple-400 w-full" />
          </div>
          <p className="text-[11px] text-slate-500">Idempotent signature validation enabled</p>
        </div>
      </div>

      {/* Live Processing Jobs Monitor */}
      <div className="p-6 rounded-2xl bg-[#0D111A] border border-white/10 space-y-4">
        <h3 className="text-lg font-bold text-white font-['Outfit']">Live AI Processing Queue</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/5 text-slate-500 font-mono">
                <th className="pb-3 font-medium">Job ID</th>
                <th className="pb-3 font-medium">User / API Key</th>
                <th className="pb-3 font-medium">Engine Route</th>
                <th className="pb-3 font-medium">Latency</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {recentJobs.map((j) => (
                <tr key={j.id} className="hover:bg-white/[0.02] transition">
                  <td className="py-3 font-mono font-bold text-white">{j.id}</td>
                  <td className="py-3 text-slate-300">{j.user}</td>
                  <td className="py-3 font-mono text-cyan-300">{j.engine}</td>
                  <td className="py-3 font-mono text-slate-400">{j.latency}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] ${
                      j.status === 'Completed'
                        ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                        : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
                    }`}>
                      {j.status}
                    </span>
                  </td>
                  <td className="py-3 text-right text-slate-500">{j.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
