import React, { useState } from 'react';
import type { ApiKey } from '../../types';
import { Plus, Copy, Check, Trash2, ShieldCheck, Terminal, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ApiKeysPage: React.FC = () => {
  const [keys, setKeys] = useState<ApiKey[]>([
    {
      id: 'key_1',
      user_id: 'usr_1',
      name: 'Production Shopify Store',
      key_prefix: 'sc_live_9fa821',
      is_active: true,
      rate_limit_per_minute: 60,
      total_requests: 1420,
      created_at: '2026-09-15T10:00:00Z',
      last_used_at: '2026-10-07T14:30:00Z',
    },
    {
      id: 'key_2',
      user_id: 'usr_1',
      name: 'Staging / Local Test Script',
      key_prefix: 'sc_live_4bc102',
      is_active: true,
      rate_limit_per_minute: 60,
      total_requests: 84,
      created_at: '2026-10-01T12:00:00Z',
      last_used_at: '2026-10-05T09:12:00Z',
    }
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [generatedSecret, setGeneratedSecret] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  const handleCreateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName) return;

    const randomSuffix = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const fullSecret = `sc_live_${randomSuffix}`;
    const prefix = `sc_live_${randomSuffix.substring(0, 6)}`;

    const newKeyItem: ApiKey = {
      id: `key_${Date.now()}`,
      user_id: 'usr_1',
      name: newKeyName,
      key_prefix: prefix,
      is_active: true,
      rate_limit_per_minute: 60,
      total_requests: 0,
      created_at: new Date().toISOString(),
    };

    setKeys([newKeyItem, ...keys]);
    setGeneratedSecret(fullSecret);
  };

  const handleRevoke = (id: string) => {
    if (confirm('Are you sure you want to revoke this API key? All applications using it will immediately lose access.')) {
      setKeys(keys.filter((k) => k.id !== id));
    }
  };

  const copySecret = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="p-6 sm:p-10 space-y-8 max-w-7xl mx-auto w-full">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-cyan-400 font-semibold uppercase tracking-wider">
              Developer Credentials
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">
            API Keys & Access Tokens
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Generate and manage secret keys to process background removals through our developer cloud gateway.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/api-docs"
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition flex items-center gap-2"
          >
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span>View API Docs</span>
          </Link>

          <button
            onClick={() => {
              setNewKeyName('');
              setGeneratedSecret(null);
              setModalOpen(true);
            }}
            className="btn-gradient-primary px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Generate New Key</span>
          </button>
        </div>
      </div>

      {/* Security Best Practices Callout */}
      <div className="p-4 rounded-xl bg-[#0D111A] border border-cyan-500/20 flex items-start gap-3 text-xs text-slate-300">
        <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-white">Keep your API keys confidential</p>
          <p className="text-slate-400">
            Never expose secret API keys in frontend codebases, mobile bundles, or public GitHub repositories. Use server-side proxies or secure webhooks.
          </p>
        </div>
      </div>

      {/* API Keys Table */}
      <div className="p-6 rounded-2xl bg-[#0D111A] border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white font-['Outfit']">Active API Keys</h3>
          <span className="text-xs font-mono text-slate-400">{keys.length} keys active</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/5 text-slate-500 font-mono">
                <th className="pb-3 font-medium">Key Name</th>
                <th className="pb-3 font-medium">Key Prefix</th>
                <th className="pb-3 font-medium">Rate Limit</th>
                <th className="pb-3 font-medium">Total Calls</th>
                <th className="pb-3 font-medium">Created</th>
                <th className="pb-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {keys.map((k) => (
                <tr key={k.id} className="hover:bg-white/[0.02] transition">
                  <td className="py-3 font-medium text-white">{k.name}</td>
                  <td className="py-3 font-mono text-cyan-300 bg-black/30 px-2 py-1 rounded inline-block">
                    {k.key_prefix}••••••••••••
                  </td>
                  <td className="py-3 text-slate-400 font-mono">{k.rate_limit_per_minute} req / min</td>
                  <td className="py-3 font-bold font-mono text-purple-300">{k.total_requests}</td>
                  <td className="py-3 text-slate-400">{new Date(k.created_at).toLocaleDateString()}</td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => handleRevoke(k.id)}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition"
                      title="Revoke Key"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Generate API Key */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0D111A] border border-cyan-500/40 rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-[0_0_50px_rgba(0,242,254,0.2)] relative space-y-6">
            
            <div>
              <h3 className="text-xl font-bold text-white font-['Outfit']">
                {generatedSecret ? 'API Key Generated' : 'Create API Secret Key'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {generatedSecret
                  ? 'Copy your secret key now. You will not be able to see it again!'
                  : 'Assign a recognizable name for where this API key will be used.'}
              </p>
            </div>

            {generatedSecret ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[#07090e] border border-cyan-500/50 flex items-center justify-between gap-3">
                  <code className="font-mono text-xs text-cyan-300 break-all">{generatedSecret}</code>
                  <button
                    onClick={() => copySecret(generatedSecret)}
                    className="p-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 shrink-0 transition"
                    title="Copy Secret"
                  >
                    {copiedKey ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Store this securely in your environment variables.</span>
                </div>

                <button
                  onClick={() => setModalOpen(false)}
                  className="btn-gradient-primary w-full py-2.5 rounded-xl text-xs font-bold"
                >
                  I have saved my secret key
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateKey} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Key Name / Description</label>
                  <input
                    type="text"
                    required
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="e.g. Next.js Production Webhook"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#07090e] border border-white/10 focus:border-cyan-400 focus:outline-none text-xs text-white transition"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-gradient-primary px-5 py-2 rounded-xl text-xs font-bold"
                  >
                    Create Secret Key
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
