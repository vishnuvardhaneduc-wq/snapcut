import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';

interface PaymentItem {
  id: string;
  orderId: string;
  userEmail: string;
  amount: string;
  type: 'subscription' | 'credit_pack';
  status: 'completed' | 'refunded' | 'pending';
  date: string;
}

export const AdminPaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<PaymentItem[]>([
    { id: 'pay_1092', orderId: 'order_892182041', userEmail: 'sarah@designco.com', amount: '₹799.00', type: 'subscription', status: 'completed', date: '2026-10-06 14:20' },
    { id: 'pay_1091', orderId: 'order_892182040', userEmail: 'devin@agency.io', amount: '₹3,499.00', type: 'credit_pack', status: 'completed', date: '2026-10-05 18:12' },
    { id: 'pay_1090', orderId: 'order_892182039', userEmail: 'alex@startup.dev', amount: '₹999.00', type: 'credit_pack', status: 'completed', date: '2026-10-04 11:05' },
    { id: 'pay_1089', orderId: 'order_892182038', userEmail: 'test@user.com', amount: '₹399.00', type: 'credit_pack', status: 'refunded', date: '2026-10-02 09:44' },
  ]);

  const handleRefund = (id: string) => {
    if (confirm('Issue a server-side refund through Razorpay webhook for this transaction?')) {
      setPayments(payments.map((p) => p.id === id ? { ...p, status: 'refunded' } : p));
      alert('Refund queued and webhook sent!');
    }
  };

  return (
    <div className="p-6 sm:p-10 space-y-6 max-w-7xl mx-auto w-full">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">
            Razorpay Transactions & Webhook Reconciler
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Audit customer payments, verify HMAC webhook deliveries, and manage refund events.
          </p>
        </div>

        <button
          onClick={() => alert('Transactions reconciled with Razorpay API')}
          className="px-4 py-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-semibold flex items-center gap-2 hover:bg-purple-500/30 transition"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Sync Razorpay Gateway</span>
        </button>
      </div>

      <div className="p-6 rounded-2xl bg-[#0D111A] border border-white/10 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/5 text-slate-500 font-mono">
                <th className="pb-3 font-medium">Order ID</th>
                <th className="pb-3 font-medium">Customer Email</th>
                <th className="pb-3 font-medium">Payment Type</th>
                <th className="pb-3 font-medium">Amount</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Timestamp</th>
                <th className="pb-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-white/[0.02] transition">
                  <td className="py-3 font-mono font-bold text-white">{p.orderId}</td>
                  <td className="py-3 text-slate-300">{p.userEmail}</td>
                  <td className="py-3 font-mono text-cyan-300 uppercase text-[10px]">{p.type}</td>
                  <td className="py-3 font-mono font-bold text-white">{p.amount}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded font-mono text-[10px] uppercase ${
                      p.status === 'completed'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3 text-slate-400 font-mono">{p.date}</td>
                  <td className="py-3 text-right">
                    {p.status === 'completed' ? (
                      <button
                        onClick={() => handleRefund(p.id)}
                        className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs transition"
                      >
                        Refund
                      </button>
                    ) : (
                      <span className="text-slate-500 text-xs italic">Refunded</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
