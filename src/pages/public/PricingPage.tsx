import React, { useState } from 'react';
import { Navbar } from '../../components/common/Navbar';
import { Footer } from '../../components/common/Footer';
import { PaymentModal } from '../../components/common/PaymentModal';
import { Link } from 'react-router-dom';
import { Check, Sparkles, Zap, ShieldCheck, HelpCircle } from 'lucide-react';

export const PricingPage: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [defaultTab, setDefaultTab] = useState<'subscription' | 'credit_pack'>('subscription');

  const handleOpenSubscribe = () => {
    setDefaultTab('subscription');
    setModalOpen(true);
  };

  const handleOpenPacks = () => {
    setDefaultTab('credit_pack');
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#07090e] text-slate-100">
      <Navbar />

      <section className="pt-16 pb-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Transparent & Flexible Pricing</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white font-['Outfit']">
              Simple Plans for Every Creator
            </h1>
            <p className="mt-4 text-slate-400 text-base">
              Start free with 5 daily image credits, or scale with Pro subscriptions & pay-as-you-go credit packs.
            </p>
          </div>

          {/* Pricing Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            
            {/* Free Plan */}
            <div className="p-8 rounded-2xl bg-[#0D111A] border border-white/10 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-white font-['Outfit']">Free Plan</h3>
                  <span className="px-2.5 py-1 rounded-full bg-white/5 text-xs text-slate-400 font-mono">Starter</span>
                </div>
                <p className="text-xs text-slate-400 mb-6">Explore the AI background removal engine</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-extrabold text-white font-['Outfit']">₹0</span>
                  <span className="text-xs text-slate-400">/ forever</span>
                </div>

                <ul className="space-y-3 text-sm text-slate-300 mb-8">
                  <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-cyan-400" /> 5 Free Images / Day</li>
                  <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-cyan-400" /> Up to 2000×2000px resolution</li>
                  <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-cyan-400" /> 24h temporary storage</li>
                  <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-cyan-400" /> Standard web workspace</li>
                </ul>
              </div>

              <Link
                to="/app/upload"
                className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/15 text-center text-sm font-semibold text-white transition block"
              >
                Use Free
              </Link>
            </div>

            {/* Pro Creator Plan */}
            <div className="p-8 rounded-2xl bg-[#0D111A] border-2 border-cyan-400 relative flex flex-col justify-between shadow-[0_0_35px_rgba(0,242,254,0.2)]">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-cyan-400 text-slate-950 text-xs font-bold uppercase tracking-wider shadow-md">
                Most Popular
              </div>
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-white font-['Outfit']">Pro Creator</h3>
                  <span className="px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-mono">Monthly</span>
                </div>
                <p className="text-xs text-slate-400 mb-6">For photographers, sellers & agencies</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-extrabold text-white font-['Outfit']">₹799</span>
                  <span className="text-xs text-slate-400">/ month</span>
                </div>

                <ul className="space-y-3 text-sm text-slate-300 mb-8">
                  <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-cyan-400" /> Unlimited Standard Cutouts</li>
                  <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-cyan-400" /> Ultra HD 5000×5000px resolution</li>
                  <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-cyan-400" /> Batch drag-and-drop processing</li>
                  <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-cyan-400" /> Developer API key access</li>
                  <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-cyan-400" /> Priority cloud queue</li>
                </ul>
              </div>

              <button
                onClick={handleOpenSubscribe}
                className="btn-gradient-primary w-full py-3 rounded-xl text-sm font-bold"
              >
                Upgrade to Pro
              </button>
            </div>

            {/* Credit Packs Card */}
            <div className="p-8 rounded-2xl bg-[#0D111A] border border-white/10 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-white font-['Outfit']">Credit Packs</h3>
                  <span className="px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-mono">Pay As You Go</span>
                </div>
                <p className="text-xs text-slate-400 mb-6">No recurring monthly commitments</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-extrabold text-white font-['Outfit']">₹399</span>
                  <span className="text-xs text-slate-400">starts at</span>
                </div>

                <ul className="space-y-3 text-sm text-slate-300 mb-8">
                  <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-purple-400" /> Credits never expire</li>
                  <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-purple-400" /> 50, 200, or 1000 credit packs</li>
                  <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-purple-400" /> Full Ultra HD access</li>
                  <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-purple-400" /> Instant Razorpay checkout</li>
                </ul>
              </div>

              <button
                onClick={handleOpenPacks}
                className="btn-gradient-neon w-full py-3 rounded-xl text-sm font-semibold"
              >
                Buy Credit Packs
              </button>
            </div>

          </div>

          {/* Secure Payment Footer */}
          <div className="flex flex-wrap items-center justify-center gap-8 py-6 border-t border-white/5 text-xs text-slate-400">
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Powered by Razorpay SSL
            </span>
            <span className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" /> Instant Crediting & Activation
            </span>
            <span className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-purple-400" /> 7-Day Money Back Guarantee
            </span>
          </div>

        </div>
      </section>

      <PaymentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultPlan={defaultTab}
      />

      <Footer />
    </div>
  );
};
