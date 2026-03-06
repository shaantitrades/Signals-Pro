'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { getPublishedPosts, BLOG_CATEGORIES, BlogPost } from '@/lib/blog-data';

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    const staticPosts = getPublishedPosts();
    try {
      const saved = JSON.parse(localStorage.getItem('blog_posts') || '[]') as BlogPost[];
      const merged = [...saved.filter((p) => p.published), ...staticPosts];
      // deduplicate by id
      const unique = merged.filter((p, i, arr) => arr.findIndex((x) => x.id === p.id) === i);
      setAllPosts(unique.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch {
      setAllPosts(staticPosts);
    }
  }, []);

  const filtered = allPosts.filter((post) => {
    const matchCat = activeCategory === 'All' || post.category === activeCategory;
    const matchSearch =
      !search ||
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const featured = filtered[0];
  const rest = filtered.slice(1);

  const categoryColors: Record<string, string> = {
    Technology: 'bg-blue-500/20 text-blue-300',
    'Market Analysis': 'bg-green-500/20 text-green-300',
    Crypto: 'bg-orange-500/20 text-orange-300',
    Education: 'bg-purple-500/20 text-purple-300',
  };

  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0d0d1a]/95 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.svg" alt="Market Signals24" width={30} height={30} />
            <span className="font-bold text-lg">Market Signals24</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/" className="text-white/60 hover:text-white transition-colors">Home</Link>
            <Link href="/tarifs" className="text-white/60 hover:text-white transition-colors">Pricing</Link>
            <Link href="/login" className="bg-violet-600 hover:bg-violet-500 text-white px-4 py-1.5 rounded-lg transition-colors">
              Sign In
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative py-16 sm:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/30 via-transparent to-blue-900/20 pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <span className="inline-block bg-violet-500/20 text-violet-300 text-xs font-semibold px-3 py-1 rounded-full mb-4 tracking-widest uppercase">
            Blog &amp; Insights
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-4">
            Market Intelligence,<br />
            <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
              Delivered Daily
            </span>
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Expert analysis, trading education, and market outlooks from the Market Signals24 research team.
          </p>

          {/* Search */}
          <div className="mt-8 max-w-md mx-auto relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm placeholder-white/30 focus:outline-none focus:border-violet-500/60 transition-colors"
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-10">
        <div className="flex flex-wrap gap-2">
          {BLOG_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/30'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        {filtered.length === 0 && (
          <div className="text-center py-20 text-white/40">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>No articles found.</p>
          </div>
        )}

        {/* Featured post */}
        {featured && (
          <Link href={`/blog/${featured.slug}`} className="group block mb-10">
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-violet-500/40 transition-all hover:shadow-xl hover:shadow-violet-500/10">
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="bg-gradient-to-br from-violet-900/60 via-blue-900/40 to-[#1a1a2e] min-h-[220px] flex items-center justify-center">
                  <svg className="w-24 h-24 text-violet-400/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="p-6 sm:p-8 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${categoryColors[featured.category] || 'bg-white/10 text-white/60'}`}>
                      {featured.category}
                    </span>
                    <span className="text-xs text-white/40">Featured</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold mb-3 group-hover:text-violet-300 transition-colors leading-snug">
                    {featured.title}
                  </h2>
                  <p className="text-white/60 text-sm leading-relaxed mb-5">{featured.excerpt}</p>
                  <div className="flex items-center gap-4 text-xs text-white/40">
                    <span>{featured.author}</span>
                    <span>·</span>
                    <span>{new Date(featured.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    <span>·</span>
                    <span>{featured.readTime} read</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* Grid */}
        {rest.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rest.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="group block">
                <article className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-violet-500/40 transition-all hover:shadow-xl hover:shadow-violet-500/10 h-full flex flex-col">
                  <div className="bg-gradient-to-br from-violet-900/40 to-[#1a1a2e] h-40 flex items-center justify-center">
                    <svg className="w-14 h-14 text-violet-400/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${categoryColors[post.category] || 'bg-white/10 text-white/60'}`}>
                        {post.category}
                      </span>
                      <span className="text-xs text-white/30">{post.readTime} read</span>
                    </div>
                    <h3 className="font-bold text-base mb-2 group-hover:text-violet-300 transition-colors leading-snug flex-1">
                      {post.title}
                    </h3>
                    <p className="text-white/50 text-xs leading-relaxed mb-4 line-clamp-3">{post.excerpt}</p>
                    <div className="flex items-center gap-2 text-xs text-white/30 mt-auto">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                        {post.author.charAt(0)}
                      </div>
                      <span>{post.author}</span>
                      <span>·</span>
                      <span>{new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 text-center text-white/30 text-sm">
        <p>© 2026 Market Signals24. All rights reserved.</p>
        <div className="flex items-center justify-center gap-4 mt-2 text-xs">
          <Link href="/terms-conditions" className="hover:text-white/60 transition-colors">Terms</Link>
          <Link href="/privacy-policy" className="hover:text-white/60 transition-colors">Privacy</Link>
          <a href="mailto:support@marketsignals24.com" className="hover:text-white/60 transition-colors">Contact</a>
        </div>
      </footer>
    </div>
  );
}
