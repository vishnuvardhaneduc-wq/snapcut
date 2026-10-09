import React, { useState } from 'react';
import { Navbar } from '../../components/common/Navbar';
import { Footer } from '../../components/common/Footer';
import { Mail, MessageSquare, Send, CheckCircle2, MapPin, Globe } from 'lucide-react';

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
              <span>We're Here to Help</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white font-['Outfit']">
              Get in Touch with Our Team
            </h1>
            <p className="mt-4 text-slate-400 text-base">
              Have questions about API volume, custom enterprise integrations, or account billing? Drop us a line.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
            
            {/* Contact Details */}
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-[#0D111A] border border-white/10 space-y-4">
                <h3 className="text-lg font-bold text-white font-['Outfit']">Support & Inquiries</h3>
                
                <div className="flex items-start gap-3 text-sm text-slate-300">
                  <Mail className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white">General & Support</p>
                    <p className="text-slate-400 text-xs">support@snapcut.ai</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-sm text-slate-300">
                  <Globe className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white">API & Enterprise Sales</p>
                    <p className="text-slate-400 text-xs">enterprise@snapcut.ai</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-sm text-slate-300">
                  <MapPin className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white">Headquarters</p>
                    <p className="text-slate-400 text-xs">San Francisco, CA & Global Remote</p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 text-xs text-slate-300">
                <span className="font-bold text-cyan-300">Average response time:</span> Less than 2 hours during business hours (Mon-Fri, 9am - 6pm EST).
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2 p-8 rounded-2xl bg-[#0D111A] border border-white/10 shadow-xl">
              {submitted ? (
                <div className="p-8 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Message Sent Successfully!</h3>
                  <p className="text-sm text-slate-400 max-w-md mx-auto">
                    Thank you for reaching out, {formData.name || 'there'}. Our support engineers will get back to you shortly at {formData.email || 'your email'}.
                  </p>
                  <button
                    onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', subject: '', message: '' }); }}
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
                        placeholder="Sarah Connor"
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
                        placeholder="sarah@company.com"
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
                      placeholder="API Integration / Billing question"
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
                      placeholder="Tell us about your use case or issue..."
                      className="w-full px-4 py-3 rounded-xl bg-[#07090e] border border-white/10 focus:border-cyan-400 focus:outline-none text-sm text-white transition resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-gradient-primary w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
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
