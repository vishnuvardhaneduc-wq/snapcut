import React from 'react';
import { Navbar } from '../../components/common/Navbar';
import { Footer } from '../../components/common/Footer';
import { Clock } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#07090e] text-slate-100">
      <Navbar />

      <section className="pt-16 pb-24 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="mb-12">
            <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
              Last Updated: October 2026
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white font-['Outfit'] mt-4">
              Privacy Policy & Ephemeral Storage
            </h1>
            <p className="mt-3 text-slate-400 text-sm">
              Your images belong to you. We do not permanently store, train public models on, or sell your uploaded photos.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0D111A] border border-cyan-500/30 mb-8 flex items-start gap-4">
            <Clock className="w-6 h-6 text-cyan-400 shrink-0 mt-1" />
            <div>
              <h3 className="text-base font-bold text-white mb-1">24-Hour Automated Expiration Guarantee</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                All uploaded input files and background-removed PNG outputs are stored strictly temporarily on encrypted Cloudinary storage and database nodes. Every asset is tagged with a 24-hour expiration TTL and permanently erased by automated cron routines.
              </p>
            </div>
          </div>

          <div className="space-y-8 text-sm text-slate-300 leading-relaxed">
            <div>
              <h2 className="text-xl font-bold text-white font-['Outfit'] mb-3">1. Information We Collect</h2>
              <p>
                When you create an account on SnapCut AI, we collect your email address, full name, and billing details processed securely via Razorpay. We do not store full credit card numbers on our servers.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white font-['Outfit'] mb-3">2. How Your Images Are Processed</h2>
              <p>
                Images uploaded through the web workspace or Developer API are routed through high-concurrency cloud workflows to AI background removal inferencing workers. Images are processed in memory and cached temporarily for you to download.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white font-['Outfit'] mb-3">3. Database Security & Row Level Security (RLS)</h2>
              <p>
                Our PostgreSQL infrastructure is powered by Supabase with Row Level Security (RLS) actively enabled across all metadata tables. Users can strictly only view, query, and manage their own uploads and API credentials.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white font-['Outfit'] mb-3">4. GDPR & Data Deletion Rights</h2>
              <p>
                You may request immediate account closure or manual deletion of your account and metadata at any time from your Account Settings or by emailing privacy@snapcut.ai.
              </p>
            </div>
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
};
