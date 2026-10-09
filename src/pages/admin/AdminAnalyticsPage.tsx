import React from 'react';
import { Cpu, Activity } from 'lucide-react';

export const AdminAnalyticsPage: React.FC = () => {
  return (
    <div className="p-6 sm:p-10 space-y-8 max-w-7xl mx-auto w-full">
      
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">
          Platform Analytics & Throughput
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Historical image volume, peak processing hours, and latency distribution across AI nodes.
        </p>
      </div>

      {/* Analytics Chart Mockup Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Daily Throughput */}
        <div className="p-6 rounded-2xl bg-[#0D111A] border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white font-['Outfit'] flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Daily Processed Cutouts (Past 7 Days)</span>
            </h3>
            <span className="text-xs font-mono text-cyan-300 font-bold">Total: 48,290</span>
          </div>

          <div className="h-48 flex items-end gap-3 pt-6 pb-2 px-2 border-b border-white/5">
            {[
              { day: 'Mon', count: 4800, h: '60%' },
              { day: 'Tue', count: 6200, h: '78%' },
              { day: 'Wed', count: 7100, h: '88%' },
              { day: 'Thu', count: 5900, h: '74%' },
              { day: 'Fri', count: 8400, h: '98%' },
              { day: 'Sat', count: 7900, h: '92%' },
              { day: 'Sun', count: 8090, h: '94%' },
            ].map((bar, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <div
                  className="w-full bg-gradient-to-t from-cyan-600 to-cyan-300 rounded-t-lg group-hover:brightness-125 transition-all shadow-[0_0_15px_rgba(0,242,254,0.3)]"
                  style={{ height: bar.h }}
                />
                <span className="text-[10px] font-mono text-slate-400">{bar.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* API vs Web Interface Ratio */}
        <div className="p-6 rounded-2xl bg-[#0D111A] border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white font-['Outfit'] flex items-center gap-2">
              <Cpu className="w-4 h-4 text-purple-400" />
              <span>Traffic Ingestion Channels</span>
            </h3>
            <span className="text-xs font-mono text-purple-300">68% API / 32% Web</span>
          </div>

          <div className="space-y-4 pt-4">
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Developer REST API Webhooks</span>
                <span className="font-mono text-cyan-400">68.2%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="w-[68%] h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Web App Upload Studio</span>
                <span className="font-mono text-purple-400">31.8%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="w-[32%] h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
