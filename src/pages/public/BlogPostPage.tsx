import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '../../components/common/Navbar';
import { Footer } from '../../components/common/Footer';
import { blogPosts } from '../../data/blogData';
import { ArrowLeft, Calendar, Clock, Sparkles } from 'lucide-react';

export const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = blogPosts.find((p) => p.slug === slug) || blogPosts[0];

  return (
    <div className="min-h-screen flex flex-col bg-[#07090e] text-slate-100">
      <Navbar />

      <article className="pt-12 pb-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex-1">
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-cyan-400 mb-8 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Articles</span>
        </Link>

        <div className="space-y-4 mb-8">
          <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
            {post.category}
          </span>
          
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white font-['Outfit'] leading-tight">
            {post.title}
          </h1>

          <div className="flex items-center gap-6 text-xs text-slate-400 pt-2 border-b border-white/5 pb-6">
            <span>By {post.author}</span>
            <span>•</span>
            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {post.date}</span>
            <span>•</span>
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {post.readTime}</span>
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden mb-10 border border-white/10 max-h-[420px]">
          <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
        </div>

        {/* Content Body */}
        <div className="prose prose-invert max-w-none space-y-6 text-slate-300 text-base leading-relaxed">
          <p className="text-lg text-slate-200 font-medium">
            High-converting digital product storefronts have one fundamental requirement in common: crisp, consistent product imagery free from distracting clutter.
          </p>

          <h2 className="text-2xl font-bold text-white font-['Outfit'] pt-4">1. Eliminating Visual Noise</h2>
          <p>
            When a buyer browses an e-commerce catalog, inconsistent background lighting, cluttered bedroom floors, or uneven shadows detract from perceived product value. By enforcing clean, isolated transparent PNG cutouts or uniform white backdrops, conversion rates see measurable increases within days of rollout.
          </p>

          <h2 className="text-2xl font-bold text-white font-['Outfit'] pt-4">2. The 24-Hour Ephemeral Privacy Model</h2>
          <p>
            Unlike traditional photo storage systems that permanently archive user uploads, SnapCut AI utilizes a 24-hour expiration token. Uploaded assets are temporarily held in high-speed Cloudinary caches for instant downloads and webhook ingestion, after which an automated cron worker deletes both the original and cutout from disk.
          </p>

          <div className="p-6 rounded-2xl bg-[#0D111A] border border-cyan-500/30 my-8">
            <div className="flex items-center gap-2 text-cyan-300 font-bold mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Key Takeaway</span>
            </div>
            <p className="text-sm text-slate-300">
              Automating your image post-processing with SnapCut AI saves hundreds of manual graphic design hours each month while preserving complete customer data confidentiality.
            </p>
          </div>
        </div>
      </article>

      <Footer />
    </div>
  );
};
