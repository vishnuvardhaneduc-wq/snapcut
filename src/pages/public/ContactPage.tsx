import React, { useState } from 'react';
import { Navbar } from '../../components/common/Navbar';
import { Footer } from '../../components/common/Footer';
import { company } from '../../config/company';
import { Mail, MessageSquare, Send, CheckCircle2, MapPin, Phone, Building2, Globe } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#07090e] text-slate-100">
      <Navbar />

      <section className="pt-16 pb-24 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-4">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Razorpay Merchant Support & Contact</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white font-['Outfit']">Contact Us</h1>
            <p className="mt-4 text-slate-400 text-base">
              Reach {company.tradeName} for billing, refunds, API volume, or product questions.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-[#0D111A] border border-white/10 space-y-5">
                <h3 className="text-lg font-bold text-white font-['Outfit']">Business Identity</h3>

                <div className="flex items-start gap-3 text-sm text-slate-300">
                  <Building2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white">Trade Name</p>
                    <p className="text-slate-400 text-xs">{company.tradeName}</p>
                    <p className="text-slate-500 text-xs mt-0.5">Legal: {company.legalName}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-sm text-slate-300">
                  <Phone className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white">Phone</p>
                    <a href={`tel:${company.phone.replace(/\s/g, '')}`} className="text-cyan-400 text-xs hover:underline">
                      {company.phone}
                    </a>
                    <p className="text-slate-500 text-xs mt-0.5">{company.hours}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-sm text-slate-300">
                  <Mail className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white">Email</p>
                    <p className="text-slate-400 text-xs">
                      Support:{' '}
                      <a className="text-cyan-400 hover:underline" href={`mailto:${company.email}`}>
                        {company.email}
                      </a>
                    </p>
                    <p className="text-slate-400 text-xs mt-0.5">
                      Billing:{' '}
                      <a className="text-cyan-400 hover:underline" href={`mailto:${company.billingEmail}`}>
                        {company.billingEmail}
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-sm text-slate-300">
                  <MapPin className="w-5 h-5 text-pink-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white">Registered / Operating Address</p>
                    <p className="text-slate-400 text-xs leading-relaxed">{company.address}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-sm text-slate-300">
                  <Globe className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white">Official Website</p>
                    <a href={company.website} className="text-cyan-400 text-xs break-all hover:underline">
                      {company.website}
                    </a>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 text-xs text-slate-300 leading-relaxed">
                Response Time: {company.supportResponse}. For payment queries, please include your Razorpay payment ID (starts with pay_).
              </div>
            </div>

            <div className="lg:col-span-2 p-8 rounded-2xl bg-[#0D111A] border border-white/10 shadow-xl">
              {submitted ? (
                <div className="p-8 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Message Received</h3>
                  <p className="text-sm text-slate-400 max-w-md mx-auto">
                    Thank you, {formData.name || 'there'}. We will reply to {formData.email || 'your email'} shortly.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ name: '', email: '', subject: '', message: '' });
                    }}
                    className="btn-gradient-primary px-6 py-2 rounded-xl text-xs font-semibold"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-2">Your Name</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Full Name"
                        className="w-full px-4 py-3 rounded-xl bg-[#07090e] border border-white/10 focus:border-cyan-400 focus:outline-none text-sm text-white transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-2">Email Address</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="you@company.com"
                        className="w-full px-4 py-3 rounded-xl bg-[#07090e] border border-white/10 focus:border-cyan-400 focus:outline-none text-sm text-white transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-2">Subject</label>
                    <input
                      type="text"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="Billing / Refund / API / Enterprise"
                      className="w-full px-4 py-3 rounded-xl bg-[#07090e] border border-white/10 focus:border-cyan-400 focus:outline-none text-sm text-white transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-2">Message</label>
                    <textarea
                      rows={5}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Describe your inquiry or include Razorpay payment ID for transaction inquiries..."
                      className="w-full px-4 py-3 rounded-xl bg-[#07090e] border border-white/10 focus:border-cyan-400 focus:outline-none text-sm text-white transition resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-gradient-primary w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Message</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
