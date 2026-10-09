import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { User, Bell, Globe, CheckCircle2, Trash2 } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, updateProfile } = useAuthStore();
  
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
  const [webhookUrl, setWebhookUrl] = useState('https://myshopify-store.com/api/snapcut-callback');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      full_name: fullName,
      avatar_url: avatarUrl,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="p-6 sm:p-10 space-y-8 max-w-4xl mx-auto w-full">
      
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono text-cyan-400 font-semibold uppercase tracking-wider">
            User Preferences
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">
          Account & Workspace Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Manage your account profile, avatar, webhook callbacks, and notification alerts.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Profile changes updated successfully!</span>
        </div>
      )}

      {/* Profile Form */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#0D111A] border border-white/10 space-y-6">
        <h3 className="text-lg font-bold text-white font-['Outfit'] flex items-center gap-2">
          <User className="w-5 h-5 text-cyan-400" />
          <span>Profile Information</span>
        </h3>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#07090e] border border-white/10 focus:border-cyan-400 focus:outline-none text-xs sm:text-sm text-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-4 py-2.5 rounded-xl bg-[#07090e]/50 border border-white/5 text-xs sm:text-sm text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Avatar Image URL</label>
            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-4 py-2.5 rounded-xl bg-[#07090e] border border-white/10 focus:border-cyan-400 focus:outline-none text-xs sm:text-sm text-white transition"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="btn-gradient-primary px-6 py-2.5 rounded-xl text-xs font-bold"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>

      {/* Webhook Callback Setting */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#0D111A] border border-white/10 space-y-4">
        <h3 className="text-lg font-bold text-white font-['Outfit'] flex items-center gap-2">
          <Globe className="w-5 h-5 text-purple-400" />
          <span>Asynchronous Webhook Ingestion</span>
        </h3>
        <p className="text-xs text-slate-400">
          When using the Developer API with async jobs, SnapCut AI will send an HTTP POST payload to this endpoint once background removal completes.
        </p>
        <input
          type="url"
          value={webhookUrl}
          onChange={(e) => setWebhookUrl(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl bg-[#07090e] border border-white/10 focus:border-purple-400 focus:outline-none text-xs font-mono text-purple-300 transition"
        />
      </div>

      {/* Notifications */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#0D111A] border border-white/10 space-y-4">
        <h3 className="text-lg font-bold text-white font-['Outfit'] flex items-center gap-2">
          <Bell className="w-5 h-5 text-emerald-400" />
          <span>Notification Preferences</span>
        </h3>
        
        <div className="space-y-3 text-xs">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" defaultChecked className="rounded accent-cyan-400 w-4 h-4" />
            <span className="text-slate-300">Email alert when daily free credits are refreshed</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" defaultChecked className="rounded accent-cyan-400 w-4 h-4" />
            <span className="text-slate-300">Email invoice receipt after each Razorpay payment</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" defaultChecked className="rounded accent-cyan-400 w-4 h-4" />
            <span className="text-slate-300">Notify when an API key reaches 80% rate limit threshold</span>
          </label>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="p-6 rounded-2xl bg-rose-500/5 border border-rose-500/20 space-y-3">
        <h4 className="text-sm font-bold text-rose-400 flex items-center gap-2">
          <Trash2 className="w-4 h-4" />
          <span>Danger Zone: Delete Account</span>
        </h4>
        <p className="text-xs text-slate-400">
          Permanently delete your user profile, credit balances, and API tokens. This action is irreversible.
        </p>
        <button
          onClick={() => {
            if (confirm('Are you absolutely sure you wish to delete your SnapCut AI account?')) {
              alert('Account deletion initiated.');
            }
          }}
          className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-semibold transition"
        >
          Delete My Account & Data
        </button>
      </div>

    </div>
  );
};
