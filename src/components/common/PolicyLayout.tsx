import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

interface PolicyLayoutProps {
  kicker: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export const PolicyLayout: React.FC<PolicyLayoutProps> = ({ kicker, title, subtitle, children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#07090e] text-slate-100">
      <Navbar />
      <section className="pt-16 pb-24 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
              {kicker}
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white font-['Outfit'] mt-4">{title}</h1>
            <p className="mt-3 text-slate-400 text-sm leading-relaxed">{subtitle}</p>
          </div>
          <div className="space-y-8 text-sm text-slate-300 leading-relaxed">{children}</div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export const PolicySection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div>
    <h2 className="text-xl font-bold text-white font-['Outfit'] mb-3">{title}</h2>
    <div className="space-y-3">{children}</div>
  </div>
);
