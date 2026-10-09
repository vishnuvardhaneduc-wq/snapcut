import React from 'react';
import { Navbar } from '../../components/common/Navbar';
import { Footer } from '../../components/common/Footer';
import { Sparkles, Shield, Cpu, Heart } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#07090e] text-slate-100">
      <Navbar />

      <section className="pt-16 pb-24 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Our Mission</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white font-['Outfit']">
              About SnapCut AI
            </h1>
            <p className="mt-4 text-slate-400 text-base leading-relaxed">
              We empower creators, developers, and global brands to isolate subjects with millimeter precision, zero latency, and absolute privacy.
            </p>
          </div>

          <div className="space-y-12 text-slate-300 leading-relaxed text-sm sm:text-base">
            
            <div className="p-8 rounded-2xl bg-[#0D111A] border border-white/10 space-y-4">
              <h2 className="text-2xl font-bold text-white font-['Outfit']">Why We Built SnapCut AI</h2>
              <p>
                Product photography, marketing design, and avatar generation shouldn't require clunky desktop software or hours of tedious manual pen-tool masking. We engineered SnapCut AI to handle even the most challenging edge cases — fine hair strands, transparent glassware, smoke, and complex jewelry — with a single click.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-[#0D111A] border border-white/10">
                <Shield className="w-8 h-8 text-cyan-400 mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">Privacy First</h3>
                <p className="text-xs text-slate-400">
                  Zero permanent image retention. All user assets are destroyed after 24 hours.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#0D111A] border border-white/10">
                <Cpu className="w-8 h-8 text-purple-400 mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">High Concurrency</h3>
                <p className="text-xs text-slate-400">
                  Powered by high-speed cloud workflows and distributed neural inferencing clusters.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#0D111A] border border-white/10">
                <Heart className="w-8 h-8 text-pink-400 mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">Creator Loved</h3>
                <p className="text-xs text-slate-400">
                  Generous daily free quotas designed to support indie developers and small businesses.
                </p>
              </div>
            </div>

          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
};
