import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';
import { ShieldCheck } from 'lucide-react';

const CURRENT_YEAR = 2026;

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-white/5 bg-[#05070A] text-slate-400 relative overflow-hidden">
      {/* Subtle top glow line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          
          {/* Col 1 & 2: Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Logo size="lg" />
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              SnapCut AI provides enterprise-grade AI background removal with hair-level precision, instant API access, and automatic 24-hour temporary file deletion.
            </p>
            
            <div className="flex items-center gap-3 pt-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>All AI Nodes Operational (99.99%)</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Zero permanent image retention — 24h Auto-Purge</span>
            </div>
          </div>

          {/* Col 3: Product */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white tracking-wider font-['Outfit'] uppercase">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/features" className="hover:text-cyan-400 transition">Features</Link></li>
              <li><Link to="/pricing" className="hover:text-cyan-400 transition">Pricing Plans</Link></li>
              <li><Link to="/app/upload" className="hover:text-cyan-400 transition">Web App</Link></li>
              <li><Link to="/api-docs" className="hover:text-cyan-400 transition">Developer API</Link></li>
            </ul>
          </div>

          {/* Col 4: Resources */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white tracking-wider font-['Outfit'] uppercase">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/blog" className="hover:text-cyan-400 transition">Blog & Tutorials</Link></li>
              <li><Link to="/api-docs" className="hover:text-cyan-400 transition">API Documentation</Link></li>
              <li><Link to="/about" className="hover:text-cyan-400 transition">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-cyan-400 transition">Support & Contact</Link></li>
            </ul>
          </div>

          {/* Col 5: Legal */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white tracking-wider font-['Outfit'] uppercase">Legal & Security</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/privacy" className="hover:text-cyan-400 transition">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-cyan-400 transition">Terms of Service</Link></li>
              <li><span className="text-slate-500 text-xs">GDPR Compliant</span></li>
              <li><span className="text-slate-500 text-xs">Cloudinary 24h Lifecycle</span></li>
            </ul>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {CURRENT_YEAR} SnapCut AI Inc. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="text-slate-400">Powered by Supabase & SnapCut AI</span>
            <span className="text-slate-600">•</span>
            <span className="text-cyan-400">Dark Neon Edition</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
