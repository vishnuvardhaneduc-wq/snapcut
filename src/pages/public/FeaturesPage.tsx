import React from 'react';
import { Navbar } from '../../components/common/Navbar';
import { Footer } from '../../components/common/Footer';
import { Link } from 'react-router-dom';
import { Sparkles, Zap, Shield, Cpu, Code2, ArrowRight, Layers, Lock } from 'lucide-react';

export const FeaturesPage: React.FC = () => {
  const featureList = [
    {
      icon: <Zap className="w-6 h-6 text-cyan-400" />,
      title: '3-Second AI Edge Cutout',
      description: 'Zero manual masking. Deep convolutional saliency models isolate hair follicles, complex textures, and transparent glass instantly.',
    },
    {
      icon: <Shield className="w-6 h-6 text-emerald-400" />,
      title: '24-Hour Temporary Auto-Purge',
      description: 'Privacy-first architecture. Files are automatically destroyed after 24 hours via Cloudinary lifecycle rules and background cron jobs.',
    },
    {
      icon: <Cpu className="w-6 h-6 text-purple-400" />,
      title: 'Ultra HD 5000×5000px Support',
      description: 'Process ultra-high resolution photography without pixel compression or downsampling up to 25 megapixels.',
    },
    {
      icon: <Code2 className="w-6 h-6 text-pink-400" />,
      title: 'Developer REST & Webhook API',
      description: 'Effortlessly integrate SnapCut AI into your SaaS, Shopify stores, or Python automated workflows with sub-second API key auth.',
    },
    {
      icon: <Layers className="w-6 h-6 text-amber-400" />,
      title: 'Multi-Backdrop Stage Studio',
      description: 'Preview cutouts on transparent checkerboard, solid e-commerce white, studio dark, or custom hex backdrops before downloading.',
    },
    {
      icon: <Lock className="w-6 h-6 text-indigo-400" />,
      title: 'Enterprise Supabase RLS Security',
      description: 'PostgreSQL Row Level Security ensures only you can view, process, and download your workspace uploads and API tokens.',
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#07090e] text-slate-100">
      <Navbar />

      <section className="pt-16 pb-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Engineered for Professionals</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white font-['Outfit']">
              Cutting-Edge AI Features
            </h1>
            <p className="mt-4 text-slate-400 text-base">
              Explore how SnapCut AI delivers unmatched accuracy, uncompromising privacy, and seamless automation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featureList.map((item, idx) => (
              <div
                key={idx}
                className="p-8 rounded-2xl bg-[#0D111A] border border-white/10 hover:border-cyan-500/40 transition duration-300 shadow-sm hover:shadow-[0_0_25px_rgba(0,242,254,0.15)] flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white font-['Outfit'] mb-3">{item.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Banner */}
          <div className="mt-20 p-8 sm:p-12 rounded-3xl bg-[#0D111A] border border-cyan-500/30 text-center relative overflow-hidden shadow-2xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-white font-['Outfit'] mb-3">
              Experience the Precision Yourself
            </h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto mb-6">
              Get 5 free credits every single day. No credit card required.
            </p>
            <Link
              to="/app/upload"
              className="btn-gradient-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold"
            >
              <span>Launch App Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
};
