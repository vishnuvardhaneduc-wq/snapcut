import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/common/Navbar';
import { Footer } from '../../components/common/Footer';
import { ImageComparisonSlider } from '../../components/common/ImageComparisonSlider';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { validateImageFile } from '../../lib/backgroundRemover';
import {
  Sparkles,
  Upload,
  Zap,
  ShieldCheck,
  Code2,
  CheckCircle2,
  Layers,
  Cpu,
  ChevronDown,
  Terminal,
  Image as ImageIcon
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { setFile } = useWorkspaceStore();

  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Sample hero comparison images
  const sampleOriginal = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=900&auto=format&fit=crop&q=80';
  const sampleCutout = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=900&auto=format&fit=crop&q=80';

  const handleFile = async (file: File) => {
    setUploadError(null);
    const validation = await validateImageFile(file);
    if (!validation.valid) {
      setUploadError(validation.error || 'Invalid file');
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setFile(file, objectUrl);
    navigate('/app/upload');
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const faqs = [
    {
      q: 'How does SnapCut AI compare with manual clipping paths in Photoshop?',
      a: 'SnapCut AI isolates intricate hair strands, transparent glass, fur, and complex product geometry in under 3 seconds using edge-saliency neural networks, saving up to 95% of manual editing time.'
    },
    {
      q: 'Are my images stored permanently on your servers?',
      a: 'Never. SnapCut AI enforces a strict 24-hour temporary lifecycle via Cloudinary and automated cron purge scripts. After 24 hours, uploaded files and cutouts are deleted permanently from all storage nodes.'
    },
    {
      q: 'What is the maximum resolution and file size supported?',
      a: 'We support JPG, JPEG, PNG, and WEBP formats up to 10MB in file size and up to 5000×5000 pixels in Ultra-HD resolution.'
    },
    {
      q: 'Can I integrate SnapCut AI into my e-commerce storefront or app?',
      a: 'Yes! Our REST API is fully integrated via developer API keys and secure webhooks. You can process images with a single HTTP POST request in Python, Node.js, cURL, or PHP.'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#07090e] text-slate-100">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-12 pb-24 lg:pt-20 lg:pb-32 overflow-hidden">
        {/* Glow Spheres */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-cyan-500/15 via-purple-600/15 to-transparent blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-12">
            
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0D111A] border border-cyan-500/30 shadow-[0_0_20px_rgba(0,242,254,0.2)] mb-6 animate-pulse-glow">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-xs font-semibold text-cyan-300 font-mono tracking-wide">
                Next-Gen Edge AI Background Remover
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white font-['Outfit'] leading-[1.1]">
              Automate Clean <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-purple-400 drop-shadow-[0_0_25px_rgba(0,242,254,0.3)]">
                AI Background Cutouts
              </span>
            </h1>

            {/* Subheading */}
            <p className="mt-6 text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto font-normal">
              Effortlessly remove backgrounds from portraits, e-commerce products, and graphics in 3 seconds. Hair-level precision with zero permanent image storage.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/app/upload"
                className="btn-gradient-primary w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4" />
                <span>Try Instant Cutout (5 Free Daily)</span>
              </Link>

              <Link
                to="/api-docs"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#0D111A] border border-white/10 hover:border-cyan-400/50 text-sm font-semibold text-slate-200 hover:text-white flex items-center justify-center gap-2 transition"
              >
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span>Explore Developer API</span>
              </Link>
            </div>

            {/* Guarantees */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" /> No Credit Card Required
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" /> 24h Auto-Purge Privacy
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" /> Up to 5000×5000px HD
              </span>
            </div>
          </div>

          {/* Interactive Upload Playground Card */}
          <div className="max-w-4xl mx-auto">
            <div className="relative p-2 rounded-2xl bg-gradient-to-b from-cyan-500/20 via-purple-500/10 to-transparent p-[1px] shadow-[0_0_40px_rgba(0,242,254,0.15)]">
              <div className="bg-[#0D111A]/90 backdrop-blur-2xl rounded-2xl p-6 sm:p-8 border border-white/5">
                
                {/* Drag Drop Area */}
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center ${
                    dragActive
                      ? 'border-cyan-400 bg-cyan-500/10 scale-[1.01]'
                      : 'border-white/10 hover:border-cyan-500/50 bg-[#07090e]/60 hover:bg-[#131823]/60'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFile(e.target.files[0]);
                      }
                    }}
                  />

                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-purple-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_20px_rgba(0,242,254,0.3)] mb-4">
                    <Upload className="w-8 h-8 animate-bounce" />
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-white font-['Outfit']">
                    Drop your image here, or <span className="text-cyan-400 underline decoration-cyan-400/40">browse</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 mt-2">
                    Supports JPG, PNG, WEBP • Max 10MB • Max 5000×5000px
                  </p>

                  {uploadError && (
                    <div className="mt-4 px-4 py-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                      {uploadError}
                    </div>
                  )}
                </div>

                {/* Sample Images row to try instantly */}
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400">
                  <span>Or test with a sample:</span>
                  <button
                    onClick={() => navigate('/app/upload')}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 transition flex items-center gap-1.5"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Portrait Model</span>
                  </button>
                  <button
                    onClick={() => navigate('/app/upload')}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 transition flex items-center gap-1.5"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
                    <span>E-commerce Shoe</span>
                  </button>
                  <button
                    onClick={() => navigate('/app/upload')}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 transition flex items-center gap-1.5"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-pink-400" />
                    <span>Jewelry & Watch</span>
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Interactive Before/After Showcase Section */}
      <section className="py-20 bg-[#090C12] border-y border-white/5 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-['Outfit']">
              Ultra-Clean Saliency Cutouts
            </h2>
            <p className="mt-3 text-slate-400 text-sm">
              Interact with the slider below to inspect sub-pixel edge detection on hair strands, fine fur, and translucent materials.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <ImageComparisonSlider
              originalUrl={sampleOriginal}
              processedUrl={sampleCutout}
              backdropMode="transparent"
            />
          </div>
        </div>
      </section>

      {/* Feature Bento Grid */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-['Outfit']">
            Built for Scale, Speed & Precision
          </h2>
          <p className="mt-3 text-slate-400 text-sm">
            Everything you need for personal photo editing or production e-commerce catalog pipelines.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Bento Card 1 */}
          <div className="p-6 rounded-2xl bg-[#0D111A] border border-white/10 hover:border-cyan-400/40 transition-all duration-300 group shadow-sm hover:shadow-[0_0_30px_rgba(0,242,254,0.15)]">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-110 transition">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white font-['Outfit'] mb-2">3-Second Neural Ingestion</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Powered by deep learning edge saliency models optimized for instant background segmentation and transparency synthesis.
            </p>
          </div>

          {/* Bento Card 2 */}
          <div className="p-6 rounded-2xl bg-[#0D111A] border border-white/10 hover:border-purple-500/40 transition-all duration-300 group shadow-sm hover:shadow-[0_0_30px_rgba(139,92,246,0.15)]">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-110 transition">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white font-['Outfit'] mb-2">24h Auto-Purge Privacy</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Your sensitive creative assets are automatically erased from temporary storage after 24 hours. Zero permanent archival.
            </p>
          </div>

          {/* Bento Card 3 */}
          <div className="p-6 rounded-2xl bg-[#0D111A] border border-white/10 hover:border-pink-500/40 transition-all duration-300 group shadow-sm hover:shadow-[0_0_30px_rgba(255,0,128,0.15)]">
            <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400 mb-4 group-hover:scale-110 transition">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white font-['Outfit'] mb-2">Multi-Backdrop Stage</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Preview your cutouts against transparent checkerboard, solid studio backdrops, or glowing neon gradients before downloading.
            </p>
          </div>

          {/* Bento Card 4 (Wide) */}
          <div className="md:col-span-2 p-6 rounded-2xl bg-[#0D111A] border border-white/10 hover:border-cyan-400/40 transition-all duration-300 group">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Code2 className="w-6 h-6" />
              </div>
              <span className="text-xs font-mono text-cyan-300 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20">
                POST /api/v1/remove-bg
              </span>
            </div>
            <h3 className="text-lg font-bold text-white font-['Outfit'] mb-2">Developer-First Webhook & REST API</h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              Integrate batch background removal directly into Shopify, WooCommerce, Python scrapers, or mobile apps with our high-performance cloud architecture.
            </p>
            <div className="p-3.5 rounded-xl bg-[#07090e] border border-white/5 font-mono text-xs text-cyan-300 overflow-x-auto">
              <code>curl -X POST https://api.snapcut.ai/v1/remove -H "x-api-key: sc_live_..." -F "image_url=https://..."</code>
            </div>
          </div>

          {/* Bento Card 5 */}
          <div className="p-6 rounded-2xl bg-[#0D111A] border border-white/10 hover:border-emerald-500/40 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white font-['Outfit'] mb-2">5000×5000px Ultra HD</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Export pixel-perfect transparent PNGs up to 25 megapixels suitable for high-res print, billboards, and 4K catalogs.
            </p>
          </div>

        </div>
      </section>

      {/* Interactive FAQ Section */}
      <section className="py-20 bg-[#090C12] border-t border-white/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-['Outfit']">Frequently Asked Questions</h2>
            <p className="mt-2 text-slate-400 text-sm">Everything you need to know about SnapCut AI</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-xl bg-[#0D111A] border border-white/10 overflow-hidden transition"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between text-base font-semibold text-white hover:text-cyan-400 transition"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${
                      activeFaq === idx ? 'rotate-180 text-cyan-400' : ''
                    }`}
                  />
                </button>
                {activeFaq === idx && (
                  <div className="px-5 pb-5 text-sm text-slate-300 leading-relaxed border-t border-white/5 pt-3 animate-in fade-in duration-200">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-20 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl bg-gradient-to-r from-cyan-950 via-[#0D111A] to-purple-950 border border-cyan-500/30 p-8 sm:p-12 text-center shadow-[0_0_50px_rgba(0,242,254,0.2)] overflow-hidden">
            
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white font-['Outfit'] mb-4">
                Ready to Cut Backgrounds in Seconds?
              </h2>
              <p className="text-slate-300 text-sm sm:text-base mb-8">
                Join over 40,000 creators, photographers, and e-commerce stores using SnapCut AI.
              </p>
              <Link
                to="/register"
                className="btn-gradient-primary inline-flex items-center gap-2 px-8 py-4 rounded-xl text-sm font-bold shadow-lg"
              >
                <Sparkles className="w-4 h-4" />
                <span>Start Free — 5 Credits Every Day</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
