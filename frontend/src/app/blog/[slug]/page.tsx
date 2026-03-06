'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useParams, notFound } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getPostBySlug, getPublishedPosts, BlogPost } from '@/lib/blog-data';

// Minimal markdown-to-HTML renderer
function renderMarkdown(text: string): string {
  return text
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-8 mb-3 text-white">$1</h2>')
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold mt-6 mb-2 text-white/90">$1</h3>')
    .replace(/^\*\*(.+?)\*\*/gm, '<strong class="text-white font-semibold">$1</strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 text-white/70 mb-1">• $1</li>')
    .replace(/```[\s\S]*?```/g, (match) => {
      const code = match.replace(/```[a-z]*\n?/, '').replace(/```$/, '');
      return `<pre class="bg-white/5 border border-white/10 rounded-xl p-4 my-4 text-sm font-mono text-violet-300 overflow-x-auto">${code}</pre>`;
    })
    .replace(/^(?!<[h|l|p|u|o|p|d|b])(.*\S.*)$/gm, '<p class="text-white/70 leading-relaxed mb-3">$1</p>')
    .replace(/\n{2,}/g, '\n');
}

const categoryColors: Record<string, string> = {
  Technology: 'bg-blue-500/20 text-blue-300',
  'Market Analysis': 'bg-green-500/20 text-green-300',
  Crypto: 'bg-orange-500/20 text-orange-300',
  Education: 'bg-purple-500/20 text-purple-300',
};

export default function BlogPostPage() {
  const params = useParams();
  const slug = typeof params?.slug === 'string' ? params.slug : '';
  const [post, setPost] = useState<BlogPost | null>(null);
  const [related, setRelated] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let found: BlogPost | undefined = getPostBySlug(slug);
    if (!found) {
      try {
        const saved = JSON.parse(localStorage.getItem('blog_posts') || '[]') as BlogPost[];
        found = saved.find((p) => p.slug === slug && p.published);
      } catch { /* empty */ }
    }
    if (!found) {
      setLoading(false);
      return;
    }
    setPost(found);

    // Related posts
    const all = getPublishedPosts();
    const rel = all.filter((p) => p.slug !== slug && p.category === found!.category).slice(0, 3);
    setRelated(rel);
    setLoading(false);
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0d1a] text-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!post) {
    notFound();
    return null;
  }

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
            <Link href="/blog" className="text-white/60 hover:text-white transition-colors">Blog</Link>
            <Link href="/login" className="bg-violet-600 hover:bg-violet-500 text-white px-4 py-1.5 rounded-lg transition-colors">
              Sign In
            </Link>
          </nav>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6">
        <div className="flex items-center gap-2 text-sm text-white/40">
          <Link href="/blog" className="hover:text-white/70 transition-colors">Blog</Link>
          <span>/</span>
          <span className="text-white/60 truncate">{post.title}</span>
        </div>
      </div>

      {/* Article */}
      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${categoryColors[post.category] || 'bg-white/10 text-white/60'}`}>
            {post.category}
          </span>
          {post.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-white/40 border border-white/10">
              #{tag}
            </span>
          ))}
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight mb-5">
          {post.title}
        </h1>

        {/* Author & date */}
        <div className="flex items-center gap-3 pb-6 border-b border-white/10 mb-8">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
            {post.author.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-sm">{post.author}</p>
            <p className="text-white/40 text-xs">{post.authorRole}</p>
          </div>
          <div className="ml-auto text-right text-xs text-white/40">
            <p>{new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p>{post.readTime} read</p>
          </div>
        </div>

        {/* Content */}
        <div
          className="prose prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
        />

        {/* CTA */}
        <div className="mt-12 bg-gradient-to-r from-violet-900/40 to-blue-900/30 border border-violet-500/30 rounded-2xl p-6 sm:p-8 text-center">
          <h3 className="text-xl font-bold mb-2">Ready to Trade Smarter?</h3>
          <p className="text-white/60 text-sm mb-5">
            Get AI-powered signals delivered in real time. Join thousands of traders already using Market Signals24.
          </p>
          <Link
            href="/register"
            className="inline-block bg-violet-600 hover:bg-violet-500 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            Start Free Trial
          </Link>
        </div>
      </article>

      {/* Related */}
      {related.length > 0 && (
        <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-16">
          <h2 className="text-lg font-bold mb-5 border-t border-white/10 pt-8">Related Articles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {related.map((r) => (
              <Link key={r.id} href={`/blog/${r.slug}`} className="group block bg-white/5 border border-white/10 rounded-xl p-4 hover:border-violet-500/40 transition-all">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${categoryColors[r.category] || 'bg-white/10 text-white/60'}`}>
                  {r.category}
                </span>
                <p className="font-semibold text-sm mt-2 group-hover:text-violet-300 transition-colors leading-snug">{r.title}</p>
                <p className="text-white/40 text-xs mt-1">{r.readTime} read</p>
              </Link>
            ))}
          </div>
        </section>
      )}

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
