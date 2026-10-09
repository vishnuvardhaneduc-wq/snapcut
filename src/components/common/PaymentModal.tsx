import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { openRazorpayCheckout } from '../../lib/razorpay';
import { Sparkles, Check, X, ShieldCheck } from 'lucide-react';

export interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPlan?: 'subscription' | 'credit_pack';
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  defaultPlan = 'subscription',
}) => {
  const { user, upgradePlan, addCredits } = useAuthStore();
  const [tab, setTab] = useState<'subscription' | 'credit_pack'>(defaultPlan);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubscribe = async (tier: 'pro' | 'enterprise', price: number, name: string) => {
    setIsProcessing(true);
    try {
      await openRazorpayCheckout({
        planId: `${tier}_monthly`,
        name,
        amount: price,
        type: 'subscription',
        userEmail: user?.email || 'customer@snapcut.ai',
        userId: user?.id || 'usr_1',
        onSuccess: (paymentId) => {
          setIsProcessing(false);
          upgradePlan(tier);
          setSuccessMsg(`Successfully upgraded to ${name}! Ref: ${paymentId}`);
          setTimeout(() => {
            setSuccessMsg(null);
            onClose();
          }, 2000);
        },
        onError: (err) => {
          setIsProcessing(false);
          console.warn('Payment closed or failed:', err);
        },
      });
    } catch {
      setIsProcessing(false);
    }
  };

  const handleBuyPack = async (credits: number, price: number, name: string) => {
    setIsProcessing(true);
    try {
      await openRazorpayCheckout({
        planId: `pack_${credits}`,
        name,
        amount: price,
        type: 'credit_pack',
        credits,
        userEmail: user?.email || 'customer@snapcut.ai',
        userId: user?.id || 'usr_1',
        onSuccess: (paymentId) => {
          setIsProcessing(false);
          addCredits(credits);
          setSuccessMsg(`Added ${credits} credits to your balance! Ref: ${paymentId}`);
          setTimeout(() => {
            setSuccessMsg(null);
            onClose();
          }, 2000);
        },
        onError: (err) => {
          setIsProcessing(false);
          console.warn('Pack error:', err);
        },
      });
    } catch {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0D111A] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-[0_0_50px_rgba(0,242,254,0.15)] overflow-hidden">
        
        {/* Glow corner */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Instant Access & High Res Downloads</span>
          </div>
          <h3 className="text-2xl font-bold text-white font-['Outfit']">Upgrade Your SnapCut AI Tier</h3>
          <p className="text-sm text-slate-400 mt-1">Select a monthly unlimited plan or pay-as-you-go credit packs</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 bg-[#07090e] rounded-xl border border-white/5 max-w-sm mx-auto mb-6">
          <button
            onClick={() => setTab('subscription')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
              tab === 'subscription'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Monthly Subscriptions
          </button>
          <button
            onClick={() => setTab('credit_pack')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
              tab === 'credit_pack'
                ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Credit Packs
          </button>
        </div>

        {/* Success Banner */}
        {successMsg && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-2">
            <Check className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Content based on Tab */}
        {tab === 'subscription' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pro Plan */}
            <div className="relative p-5 rounded-xl bg-[#131823] border-2 border-cyan-400/50 hover:border-cyan-400 transition flex flex-col justify-between shadow-[0_0_20px_rgba(0,242,254,0.1)]">
              <div className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-cyan-400 text-slate-950 text-[10px] font-bold tracking-wider uppercase">
                Most Popular
              </div>
              <div>
                <h4 className="text-lg font-bold text-white">Pro Creator</h4>
                <p className="text-xs text-slate-400 mb-3">Ideal for designers & ecommerce</p>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-3xl font-extrabold text-white font-['Outfit']">₹799</span>
                  <span className="text-xs text-slate-400">/ month</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-300 mb-6">
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-cyan-400" /> Unlimited standard removals</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-cyan-400" /> 5000x5000px Ultra HD cutouts</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-cyan-400" /> Batch upload processing</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-cyan-400" /> Developer API key access</li>
                </ul>
              </div>
              <button
                disabled={isProcessing}
                onClick={() => handleSubscribe('pro', 799, 'Pro Creator Monthly')}
                className="btn-gradient-primary w-full py-2.5 rounded-xl text-xs font-bold"
              >
                {isProcessing ? 'Connecting Gateway...' : 'Upgrade to Pro'}
              </button>
            </div>

            {/* Enterprise Plan */}
            <div className="p-5 rounded-xl bg-[#131823] border border-white/10 hover:border-purple-500/50 transition flex flex-col justify-between">
              <div>
                <h4 className="text-lg font-bold text-white">Scale & Studio</h4>
                <p className="text-xs text-slate-400 mb-3">For high-throughput platforms</p>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-3xl font-extrabold text-white font-['Outfit']">₹2,499</span>
                  <span className="text-xs text-slate-400">/ month</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-300 mb-6">
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-purple-400" /> High-concurrency AI node processing</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-purple-400" /> 10,000 API calls / minute</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-purple-400" /> Dedicated priority queue</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-purple-400" /> 24/7 SLA & custom webhooks</li>
                </ul>
              </div>
              <button
                disabled={isProcessing}
                onClick={() => handleSubscribe('enterprise', 2499, 'Scale & Studio Monthly')}
                className="btn-gradient-neon w-full py-2.5 rounded-xl text-xs font-bold"
              >
                {isProcessing ? 'Connecting Gateway...' : 'Upgrade to Scale'}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Pack 1 */}
            <div className="p-4 rounded-xl bg-[#131823] border border-white/10 text-center flex flex-col justify-between">
              <div>
                <h5 className="text-sm font-semibold text-white">Starter Pack</h5>
                <p className="text-2xl font-bold text-cyan-400 font-mono my-2">50</p>
                <p className="text-xs text-slate-400 mb-4">Never expiring credits</p>
                <p className="text-lg font-bold text-white mb-4">₹399</p>
              </div>
              <button
                disabled={isProcessing}
                onClick={() => handleBuyPack(50, 399, '50 Credit Pack')}
                className="w-full py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition"
              >
                Buy 50
              </button>
            </div>

            {/* Pack 2 */}
            <div className="p-4 rounded-xl bg-[#131823] border-2 border-purple-500/50 text-center flex flex-col justify-between relative shadow-[0_0_15px_rgba(139,92,246,0.15)]">
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-purple-500 text-white text-[9px] font-bold uppercase">
                Best Value
              </div>
              <div>
                <h5 className="text-sm font-semibold text-white">Power Pack</h5>
                <p className="text-2xl font-bold text-purple-400 font-mono my-2">200</p>
                <p className="text-xs text-slate-400 mb-4">₹4.99 per image</p>
                <p className="text-lg font-bold text-white mb-4">₹999</p>
              </div>
              <button
                disabled={isProcessing}
                onClick={() => handleBuyPack(200, 999, '200 Credit Pack')}
                className="btn-gradient-neon w-full py-2 rounded-lg text-xs font-semibold"
              >
                Buy 200
              </button>
            </div>

            {/* Pack 3 */}
            <div className="p-4 rounded-xl bg-[#131823] border border-white/10 text-center flex flex-col justify-between">
              <div>
                <h5 className="text-sm font-semibold text-white">Mega Studio</h5>
                <p className="text-2xl font-bold text-pink-400 font-mono my-2">1,000</p>
                <p className="text-xs text-slate-400 mb-4">₹3.49 per image</p>
                <p className="text-lg font-bold text-white mb-4">₹3,499</p>
              </div>
              <button
                disabled={isProcessing}
                onClick={() => handleBuyPack(1000, 3499, '1,000 Credit Pack')}
                className="w-full py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition"
              >
                Buy 1,000
              </button>
            </div>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>256-Bit SSL Encrypted Razorpay Checkout</span>
          </div>
          <span>Cancel anytime with 1-click</span>
        </div>
      </div>
    </div>
  );
};
