export interface BlogPostItem {
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  readTime: string;
  date: string;
  image: string;
  category: string;
}

export const blogPosts: BlogPostItem[] = [
  {
    slug: 'optimizing-ecommerce-product-photos-ai',
    title: 'How AI Background Removal Increases Shopify Conversion Rates by 34%',
    excerpt: 'Discover why high-contrast, pure white or transparent product staging dramatically reduces bounce rates and drives customer trust.',
    author: 'Elena Vance',
    readTime: '4 min read',
    date: 'Oct 04, 2026',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
    category: 'E-commerce',
  },
  {
    slug: 'deep-learning-hair-edge-saliency',
    title: 'Under the Hood: How Convolutional Neural Nets Isolate Hair Strands',
    excerpt: 'An engineering deep dive into alpha matting, saliency map generation, and how SnapCut AI detects delicate fur and transparent glass.',
    author: 'Devin Chen',
    readTime: '6 min read',
    date: 'Sep 28, 2026',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
    category: 'AI Engineering',
  },
  {
    slug: 'privacy-first-saas-temporary-storage',
    title: 'Why 24-Hour File Auto-Purge is the Future of Privacy in AI SaaS',
    excerpt: 'Learn how automated ephemeral storage architectures protect customer IP without sacrificing high-performance webhook delivery.',
    author: 'Marcus Brody',
    readTime: '3 min read',
    date: 'Sep 15, 2026',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
    category: 'Security',
  }
];
