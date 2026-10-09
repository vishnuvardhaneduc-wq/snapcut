import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { PaymentModal } from '../../components/common/PaymentModal';
import { Sparkles, Download } from 'lucide-react';

export const BillingPage: React.FC = () => {
  const { user, credits } = useAuthStore();
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [defaultTab, setDefaultTab] = useState<'subscription' | 'credit_pack'>('subscription');

  const transactions = [
    {
      id: 'tx_9812491',
      date: 'Oct 06, 2026',
      description: 'Pro Creator Monthly Subscription',
      amount: '₹799.00',
      status: 'Paid',
      invoice: '#INV-2026-001',
    },
    {
      id: 'tx_9812490',
      date: 'Sep 28, 2026',
      description: 'Power Pack (200 Extra Credits)',
      amount: '₹999.00',
      status: 'Paid',
      invoice: '#INV-2026-002',
    }
  ];

  return (
    <div className="p-6 sm:p-10 space-y-8 max-w-7xl mx-auto w-full">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-cyan-400 font-semibold uppercase tracking-wider">
              Subscription & Invoicing
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">
            Billing & Active Plans
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage your Razorpay subscriptions, invoices, and credit balances.
          </p>
        </div>

        <button
          onClick={() => {
            setDefaultTab('subscription');
            setPaymentModalOpen(true);
          }}
          className="btn-gradient-primary px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>Change / Upgrade Plan</span>
        </button>
      </div>

      {/* Current Plan Overview Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#0D111A] border border-cyan-500/30 shadow-[0_0_30px_rgba(0,242,254,0.1)] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold font-mono uppercase">
            Active: {user?.plan || 'Free'} Tier
          </div>
          <h3 className="text-2xl font-bold text-white font-['Outfit']">
            {user?.plan === 'pro' ? 'Pro Creator Plan (Unlimited)' : user?.plan === 'enterprise' ? 'Scale & Enterprise Plan' : 'Free Starter Tier'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md">
            {user?.plan === 'pro'
              ? 'Includes unlimited standard cutouts, 5000x5000px Ultra HD, and priority developer API access.'
              : 'Includes 5 free credits every 24 hours. Upgrade for high-volume batch processing and Ultra HD.'}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#131823] border border-white/5 space-y-2 min-w-[220px]">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Cycle Renewal:</span>
            <span className="text-white font-mono">In 28 days</span>
          </div>
          <div className="flex justify-between text-xs text-slate-400">
            <span>Payment Method:</span>
            <span className="text-cyan-300 font-mono">Razorpay Auto</span>
          </div>
          <div className="flex justify-between text-xs text-slate-400">
            <span>Extra Credits:</span>
            <span className="text-purple-300 font-bold font-mono">{credits.balance} remaining</span>
          </div>
        </div>
      </div>

      {/* Transaction History Table */}
      <div className="p-6 rounded-2xl bg-[#0D111A] border border-white/10 space-y-4">
        <h3 className="text-lg font-bold text-white font-['Outfit']">Payment Invoices & Receipts</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/5 text-slate-500 font-mono">
                <th className="pb-3 font-medium">Invoice</th>
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Description</th>
                <th className="pb-3 font-medium">Amount</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-white/[0.02] transition">
                  <td className="py-3 font-mono font-bold text-white">{tx.invoice}</td>
                  <td className="py-3 text-slate-400">{tx.date}</td>
                  <td className="py-3 font-medium text-slate-200">{tx.description}</td>
                  <td className="py-3 font-mono font-bold text-white">{tx.amount}</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[10px]">
                      {tx.status}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => alert(`Downloading Invoice ${tx.invoice}`)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition"
                      title="Download Invoice"
                    >
                      <Download className="w-4 h-4" />
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
        defaultPlan={defaultTab}
      />

    </div>
  );
};
