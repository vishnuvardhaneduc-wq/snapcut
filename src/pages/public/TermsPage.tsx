import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../../components/common/Navbar';
import { Footer } from '../../components/common/Footer';
import { company } from '../../config/company';

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
              Terms and Conditions
            </h1>
            <p className="mt-3 text-slate-400 text-sm">
              These terms govern your use of {company.website} and the {company.tradeName} AI service provided by {company.legalName}.
            </p>
          </div>

          <div className="space-y-8 text-sm text-slate-300 leading-relaxed">
            <div>
              <h2 className="text-xl font-bold text-white font-['Outfit'] mb-3">1. Agreement to Terms</h2>
              <p>
                By registering an account, purchasing credits or subscriptions through Razorpay, or using the {company.tradeName} platform, you agree to these Terms, our{' '}
                <Link to="/privacy" className="text-cyan-400 hover:underline">Privacy Policy</Link>,{' '}
                <Link to="/refund" className="text-cyan-400 hover:underline">Refund and Cancellation Policy</Link>, and{' '}
                <Link to="/shipping" className="text-cyan-400 hover:underline">Shipping and Delivery Policy</Link>.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white font-['Outfit'] mb-3">2. Service Description</h2>
              <p>
                {company.tradeName} is a software platform providing automated AI background removal and image processing. Services are delivered digitally with instant access upon account creation or payment.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white font-['Outfit'] mb-3">3. Acceptable Use Policy</h2>
              <p>
                You may not upload, process, or distribute illegal content, non-consensual imagery, malicious payloads, or attempt to reverse-engineer edge models or bypass rate limits.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white font-['Outfit'] mb-3">4. Payments & Razorpay Billing</h2>
              <p>
                Prices are listed in INR. Payments are collected by Razorpay. Subscriptions renew monthly until cancelled. Credit packs are non-expiring. You can manage or cancel your subscription at any time in the app workspace.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white font-['Outfit'] mb-3">5. Governing Law & Jurisdiction</h2>
              <p>
                These terms shall be governed by and construed in accordance with the laws of India. Any disputes arising shall be subject to the exclusive jurisdiction of courts in Hyderabad, Telangana.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white font-['Outfit'] mb-3">6. Contact Information</h2>
              <p>
                {company.legalName} ({company.tradeName})
                <br />
                {company.address}
                <br />
                Email: {company.email} · Phone: {company.phone}
              </p>
            </div>
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
};

