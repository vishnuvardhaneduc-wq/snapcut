import React from 'react';
import { Navbar } from '../../components/common/Navbar';
import { Footer } from '../../components/common/Footer';

export const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#07090e] text-slate-100">
      <Navbar />

      <section className="pt-16 pb-24 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="mb-12">
            <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
              Effective Date: October 2026
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white font-['Outfit'] mt-4">
              Terms of Service
            </h1>
            <p className="mt-3 text-slate-400 text-sm">
              Please read these Terms of Service carefully before utilizing SnapCut AI.
            </p>
          </div>

          <div className="space-y-8 text-sm text-slate-300 leading-relaxed">
            <div>
              <h2 className="text-xl font-bold text-white font-['Outfit'] mb-3">1. Service Acceptance</h2>
              <p>
                By registering an account, connecting an API key, or using SnapCut AI web interfaces, you agree to comply with these terms, our acceptable use policy, and applicable laws.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white font-['Outfit'] mb-3">2. Acceptable Use Policy</h2>
              <p>
                You may not upload, process, or distribute illegal content, non-consensual imagery, malicious payloads, or attempt to reverse-engineer proprietary edge models or rate limit restrictions.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white font-['Outfit'] mb-3">3. Subscriptions & Billing</h2>
              <p>
                Subscriptions are billed on a recurring monthly cycle via Razorpay. You can cancel your subscription at any time within your billing dashboard. Unused pay-as-you-go credit packs do not expire.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white font-['Outfit'] mb-3">4. Limitation of Liability</h2>
              <p>
                SnapCut AI is provided on an "as is" and "as available" basis without warranties of any kind. Under no circumstances will SnapCut AI be liable for indirect or consequential damages.
              </p>
            </div>
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
};
