import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../../components/common/Navbar';
import { Footer } from '../../components/common/Footer';
import { Clock } from 'lucide-react';
import { company } from '../../config/company';

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
              Privacy Policy
            </h1>
            <p className="mt-3 text-slate-400 text-sm">
              This policy explains how {company.legalName} (trading as {company.tradeName}) collects, protects, and handles personal data on {company.website}.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0D111A] border border-cyan-500/30 mb-8 flex items-start gap-4">
            <Clock className="w-6 h-6 text-cyan-400 shrink-0 mt-1" />
            <div>
              <h3 className="text-base font-bold text-white mb-1">24-Hour Automated Expiration Guarantee</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                All uploaded input files and background-removed PNG outputs are stored strictly temporarily for download. Every asset is tagged with a 24-hour expiration TTL and permanently erased by automated deletion routines. We do not sell or train public models on user images.
              </p>
            </div>
          </div>

          <div className="space-y-8 text-sm text-slate-300 leading-relaxed">
            <div>
              <h2 className="text-xl font-bold text-white font-['Outfit'] mb-3">1. Information We Collect</h2>
              <p>
                When you create an account on {company.tradeName}, we collect your email address, full name, and billing details processed securely via Razorpay. We do not store credit card numbers, CVVs, or bank credentials on our servers.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white font-['Outfit'] mb-3">2. How Your Images Are Processed</h2>
              <p>
                Images uploaded through the web workspace or Developer API are routed through high-concurrency cloud workflows to AI background removal inferencing workers. Images are processed in memory and cached temporarily for you to download.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white font-['Outfit'] mb-3">3. Payment Information & Razorpay</h2>
              <p>
                Payments are processed through Razorpay's PCI-DSS Level 1 compliant gateway. Razorpay handles payment details (UPI, cards, netbanking) in accordance with its privacy standards.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white font-['Outfit'] mb-3">4. Your Rights & Data Deletion</h2>
              <p>
                You may request immediate account closure or deletion of your account metadata at any time from your Account Settings or by emailing{' '}
                <a className="text-cyan-400 hover:underline" href={`mailto:${company.email}`}>
                  {company.email}
                </a>
                .
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white font-['Outfit'] mb-3">5. Contact Information</h2>
              <p>
                {company.legalName} ({company.tradeName})
                <br />
                Address: {company.address}
                <br />
                Email: {company.email} · Phone: {company.phone}
                <br />
                See also <Link to="/contact" className="text-cyan-400 hover:underline">Contact Us</Link> and{' '}
                <Link to="/terms" className="text-cyan-400 hover:underline">Terms and Conditions</Link>.
              </p>
            </div>
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
};

