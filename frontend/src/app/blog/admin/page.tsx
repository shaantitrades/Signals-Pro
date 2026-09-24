'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { BLOG_POSTS, BlogPost, BLOG_CATEGORIES } from '@/lib/blog-data';

const ADMIN_EMAIL = 'admin@trades.com';
const ADMIN_PASSWORD = '0080';
const SESSION_KEY = 'blog_admin_session';
const PARTNERS_KEY = 'custom_partners';

interface CustomPartner {
  id: string;
  name: string;
  url: string;
  subtitle: string;
  desc: string;
  score: string;
  bonus: string;
  promoCode: string;
  tags: string[];
  color: string;
  initial: string;
  active: boolean;
}

const PARTNER_COLORS = [
  { label: 'Violet / Pink', value: 'bg-gradient-to-br from-violet-600 to-pink-500' },
  { label: 'Emerald / Teal', value: 'bg-gradient-to-br from-emerald-500 to-teal-600' },
  { label: 'Blue / Indigo', value: 'bg-gradient-to-br from-blue-600 to-indigo-700' },
  { label: 'Orange / Amber', value: 'bg-gradient-to-br from-orange-500 to-amber-600' },
  { label: 'Rose / Red', value: 'bg-gradient-to-br from-rose-500 to-red-600' },
  { label: 'Cyan / Sky', value: 'bg-gradient-to-br from-cyan-500 to-sky-600' },
];

const emptyPartner = (): Omit<CustomPartner, 'id'> => ({
  name: '',
  url: '',
  subtitle: '',
  desc: '',
  score: '',
  bonus: '',
  promoCode: '',
  tags: [],
  color: PARTNER_COLORS[0].value,
  initial: '',
  active: true,
});

const emptyForm = (): Omit<BlogPost, 'id'> => ({
  slug: '',
  title: '',
  excerpt: '',
  content: '',
  category: 'Education',
  author: '',
  authorRole: '',
  date: new Date().toISOString().split('T')[0],
  readTime: '5 min',
  image: '',
  tags: [],
  published: true,
});

export default function BlogAdminPage() {
  const [authed, setAuthed] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [view, setView] = useState<'list' | 'new' | 'edit'>('list');
  const [form, setForm] = useState<Omit<BlogPost, 'id'>>(emptyForm());
  const [editId, setEditId] = useState<string | null>(null);
  const [saveMsg, setSaveMsg] = useState('');
  const [tagInput, setTagInput] = useState('');

  // Partners state
  const [adminTab, setAdminTab] = useState<'blog' | 'partners'>('blog');
  const [partners, setPartners] = useState<CustomPartner[]>([]);
  const [partnerView, setPartnerView] = useState<'list' | 'new' | 'edit'>('list');
  const [partnerForm, setPartnerForm] = useState<Omit<CustomPartner, 'id'>>(emptyPartner());
  const [partnerEditId, setPartnerEditId] = useState<string | null>(null);
  const [partnerSaveMsg, setPartnerSaveMsg] = useState('');
  const [partnerTagInput, setPartnerTagInput] = useState('');

  useEffect(() => {
    const session = sessionStorage.getItem(SESSION_KEY);
    if (session === 'true') setAuthed(true);
  }, []);

  useEffect(() => {
    if (!authed) return;
    try {
      const saved = JSON.parse(localStorage.getItem('blog_posts') || '[]') as BlogPost[];
      setPosts(saved);
    } catch { setPosts([]); }
  }, [authed]);

  useEffect(() => {
    if (!authed) return;
    try {
      const saved = JSON.parse(localStorage.getItem(PARTNERS_KEY) || '[]') as CustomPartner[];
      setPartners(saved);
    } catch { setPartners([]); }
  }, [authed]);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (email.trim().toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, 'true');
      setAuthed(true);
      setLoginError('');
    } else {
      setLoginError('Invalid credentials. Please try again.');
    }
  }

  function handleLogout() {
    sessionStorage.removeItem(SESSION_KEY);
    setAuthed(false);
    setEmail('');
    setPassword('');
  }

  function savePosts(updated: BlogPost[]) {
    localStorage.setItem('blog_posts', JSON.stringify(updated));
    setPosts(updated);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const slug = form.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    if (editId) {
      const updated = posts.map((p) => p.id === editId ? { ...form, slug, id: editId } : p);
      savePosts(updated);
    } else {
      const newPost: BlogPost = { ...form, slug, id: Date.now().toString() };
      savePosts([newPost, ...posts]);
    }
    setSaveMsg('Article saved successfully!');
    setTimeout(() => setSaveMsg(''), 3000);
    setView('list');
    setForm(emptyForm());
    setEditId(null);
  }

  function handleEdit(post: BlogPost) {
    setForm({ ...post });
    setEditId(post.id);
    setView('edit');
  }

  function handleDelete(id: string) {
    if (!confirm('Delete this article?')) return;
    savePosts(posts.filter((p) => p.id !== id));
  }

  function togglePublish(id: string) {
    savePosts(posts.map((p) => p.id === id ? { ...p, published: !p.published } : p));
  }

  function addTag() {
    const t = tagInput.trim();
    if (t && !form.tags.includes(t)) {
      setForm((f) => ({ ...f, tags: [...f.tags, t] }));
    }
    setTagInput('');
  }

  function removeTag(tag: string) {
    setForm((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }));
  }

  // ── Partner CRUD ──
  function savePartners(updated: CustomPartner[]) {
    localStorage.setItem(PARTNERS_KEY, JSON.stringify(updated));
    setPartners(updated);
  }

  function handlePartnerSubmit(e: React.FormEvent) {
    e.preventDefault();
    const initial = partnerForm.initial || partnerForm.name.slice(0, 2).toUpperCase();
    if (partnerEditId) {
      savePartners(partners.map((p) => p.id === partnerEditId ? { ...partnerForm, initial, id: partnerEditId } : p));
    } else {
      savePartners([...partners, { ...partnerForm, initial, id: Date.now().toString() }]);
    }
    setPartnerSaveMsg('Partner saved!');
    setTimeout(() => setPartnerSaveMsg(''), 3000);
    setPartnerView('list');
    setPartnerForm(emptyPartner());
    setPartnerEditId(null);
  }

  function handlePartnerEdit(partner: CustomPartner) {
    setPartnerForm({ ...partner });
    setPartnerEditId(partner.id);
    setPartnerView('edit');
  }

  function handlePartnerDelete(id: string) {
    if (!confirm('Delete this partner?')) return;
    savePartners(partners.filter((p) => p.id !== id));
  }

  function togglePartnerActive(id: string) {
    savePartners(partners.map((p) => p.id === id ? { ...p, active: !p.active } : p));
  }

  function addPartnerTag() {
    const t = partnerTagInput.trim();
    if (t && !partnerForm.tags.includes(t)) {
      setPartnerForm((f) => ({ ...f, tags: [...f.tags, t] }));
    }
    setPartnerTagInput('');
  }

  function removePartnerTag(tag: string) {
    setPartnerForm((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }));
  }

  // Merge static + dynamic posts for display in admin
  const allPostsForDisplay = [
    ...posts,
    ...BLOG_POSTS.filter((sp) => !posts.find((p) => p.id === sp.id)),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  /* ──────────────── LOGIN SCREEN ──────────────── */
  if (!authed) {
    return (
      <div className="min-h-screen bg-[#0d0d1a] text-white flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <Image src="/logo.svg" alt="Market Signals24" width={36} height={36} />
              <span className="font-bold text-xl">Market Signals24</span>
            </Link>
            <h1 className="text-2xl font-bold">Blog Administration</h1>
            <p className="text-white/50 text-sm mt-1">Sign in to manage your blog content</p>
          </div>

          <form onSubmit={handleLogin} className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8">
            {loginError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3 mb-5 flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {loginError}
              </div>
            )}
            <div className="mb-4">
              <label className="block text-sm font-medium text-white/80 mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@trades.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm placeholder-white/20 focus:outline-none focus:border-violet-500/70 transition-colors"
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-white/80 mb-1.5">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm placeholder-white/20 focus:outline-none focus:border-violet-500/70 transition-colors"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-violet-600 hover:bg-violet-500 text-white py-3 rounded-xl font-semibold transition-colors"
            >
              Sign In
            </button>
          </form>

          <p className="text-center text-white/30 text-xs mt-6">
            <Link href="/blog" className="hover:text-white/60 transition-colors">← Back to Blog</Link>
          </p>
        </div>
      </div>
    );
  }

  /* ──────────────── FORM (NEW / EDIT) ──────────────── */
  const isFormView = view === 'new' || view === 'edit';

  if (isFormView) {
    return (
      <div className="min-h-screen bg-[#0d0d1a] text-white">
        <header className="border-b border-white/10 bg-[#0d0d1a]/95 backdrop-blur-sm sticky top-0 z-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image src="/logo.svg" alt="Market Signals24" width={28} height={28} />
              <span className="font-bold">Blog Admin</span>
              <span className="text-white/30">/</span>
              <span className="text-violet-400 text-sm">{view === 'edit' ? 'Edit Article' : 'New Article'}</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => { setView('list'); setForm(emptyForm()); setEditId(null); }}
                className="text-white/50 hover:text-white text-sm transition-colors"
              >
                ← Cancel
              </button>
              <button onClick={handleLogout} className="text-white/40 hover:text-red-400 text-xs transition-colors">
                Logout
              </button>
            </div>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main */}
            <div className="lg:col-span-2 space-y-5">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1.5">Title *</label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Article title..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500/70 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1.5">Slug (URL)</label>
                <input
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  placeholder="auto-generated-from-title"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-violet-500/70 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1.5">Excerpt *</label>
                <textarea
                  required
                  rows={3}
                  value={form.excerpt}
                  onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                  placeholder="Short description shown in blog listing..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-violet-500/70 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1.5">Content * <span className="text-white/30 font-normal">(Markdown supported)</span></label>
                <textarea
                  required
                  rows={18}
                  value={form.content}
                  onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                  placeholder="## Introduction&#10;&#10;Write your article here using Markdown syntax..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono resize-y focus:outline-none focus:border-violet-500/70 transition-colors"
                />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
                <h3 className="font-semibold text-sm text-white/80">Publish settings</h3>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/60">Status</span>
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, published: !f.published }))}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                      form.published ? 'bg-green-500/20 text-green-300' : 'bg-white/10 text-white/50'
                    }`}
                  >
                    {form.published ? 'Published' : 'Draft'}
                  </button>
                </div>
                <div>
                  <label className="block text-xs text-white/60 mb-1">Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500/70"
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/60 mb-1">Read time</label>
                  <input
                    value={form.readTime}
                    onChange={(e) => setForm((f) => ({ ...f, readTime: e.target.value }))}
                    placeholder="5 min"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500/70"
                  />
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
                <h3 className="font-semibold text-sm text-white/80">Author</h3>
                <div>
                  <label className="block text-xs text-white/60 mb-1">Name *</label>
                  <input
                    required
                    value={form.author}
                    onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
                    placeholder="John Smith"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500/70"
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/60 mb-1">Role</label>
                  <input
                    value={form.authorRole}
                    onChange={(e) => setForm((f) => ({ ...f, authorRole: e.target.value }))}
                    placeholder="Senior Analyst"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500/70"
                  />
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
                <h3 className="font-semibold text-sm text-white/80">Category &amp; Tags</h3>
                <div>
                  <label className="block text-xs text-white/60 mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    className="w-full bg-[#1a1a2e] border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500/70"
                  >
                    {BLOG_CATEGORIES.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-white/60 mb-1">Tags</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                      placeholder="Add tag"
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500/70"
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="bg-violet-600 hover:bg-violet-500 text-white text-xs px-3 py-2 rounded-lg transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {form.tags.map((tag) => (
                      <span key={tag} className="flex items-center gap-1 bg-white/10 text-xs px-2 py-0.5 rounded-full text-white/70">
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)} className="text-white/40 hover:text-red-400 transition-colors">×</button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-violet-600 hover:bg-violet-500 text-white py-3 rounded-xl font-semibold transition-colors"
              >
                {view === 'edit' ? 'Update Article' : 'Publish Article'}
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  }

  /* ──────────────── PARTNER FORM (NEW / EDIT) ──────────────── */
  if (adminTab === 'partners' && (partnerView === 'new' || partnerView === 'edit')) {
    return (
      <div className="min-h-screen bg-[#0d0d1a] text-white">
        <header className="border-b border-white/10 bg-[#0d0d1a]/95 backdrop-blur-sm sticky top-0 z-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image src="/logo.svg" alt="Market Signals24" width={28} height={28} />
              <span className="font-bold">Admin</span>
              <span className="text-white/30">/</span>
              <span className="text-emerald-400 text-sm">Partners</span>
              <span className="text-white/30">/</span>
              <span className="text-white/60 text-sm">{partnerView === 'edit' ? 'Edit Partner' : 'New Partner'}</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => { setPartnerView('list'); setPartnerForm(emptyPartner()); setPartnerEditId(null); }}
                className="text-white/50 hover:text-white text-sm transition-colors"
              >
                ← Cancel
              </button>
              <button onClick={handleLogout} className="text-white/40 hover:text-red-400 text-xs transition-colors">
                Logout
              </button>
            </div>
          </div>
        </header>

        <form onSubmit={handlePartnerSubmit} className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1.5">Partner Name *</label>
              <input
                required
                value={partnerForm.name}
                onChange={(e) => setPartnerForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. My Broker"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/70 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1.5">Avatar Initial(s)</label>
              <input
                value={partnerForm.initial}
                onChange={(e) => setPartnerForm((f) => ({ ...f, initial: e.target.value }))}
                placeholder="e.g. PO (auto-set from name)"
                maxLength={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/70 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-1.5">URL *</label>
            <input
              required
              type="url"
              value={partnerForm.url}
              onChange={(e) => setPartnerForm((f) => ({ ...f, url: e.target.value }))}
              placeholder="https://..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-emerald-500/70 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-1.5">Subtitle *</label>
            <input
              required
              value={partnerForm.subtitle}
              onChange={(e) => setPartnerForm((f) => ({ ...f, subtitle: e.target.value }))}
              placeholder="e.g. Forex & Crypto Broker"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/70 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-1.5">Description *</label>
            <textarea
              required
              rows={4}
              value={partnerForm.desc}
              onChange={(e) => setPartnerForm((f) => ({ ...f, desc: e.target.value }))}
              placeholder="Short description shown on the partner card..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-emerald-500/70 transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1.5">Score</label>
              <input
                value={partnerForm.score}
                onChange={(e) => setPartnerForm((f) => ({ ...f, score: e.target.value }))}
                placeholder="e.g. 4.9/5"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/70 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1.5">Bonus</label>
              <input
                value={partnerForm.bonus}
                onChange={(e) => setPartnerForm((f) => ({ ...f, bonus: e.target.value }))}
                placeholder="e.g. 60-80%"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/70 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1.5">Promo Code</label>
              <input
                value={partnerForm.promoCode}
                onChange={(e) => setPartnerForm((f) => ({ ...f, promoCode: e.target.value }))}
                placeholder="e.g. PMQ023"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-emerald-500/70 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Avatar Color</label>
            <div className="flex flex-wrap gap-2">
              {PARTNER_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setPartnerForm((f) => ({ ...f, color: c.value }))}
                  className={`w-8 h-8 rounded-lg ${c.value} ring-2 transition-all ${partnerForm.color === c.value ? 'ring-white ring-offset-2 ring-offset-[#0d0d1a]' : 'ring-transparent'}`}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-1.5">Tags</label>
            <div className="flex gap-2 mb-2">
              <input
                value={partnerTagInput}
                onChange={(e) => setPartnerTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addPartnerTag(); } }}
                placeholder="Add tag (e.g. Forex, Prop Firm...)"
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/70 transition-colors"
              />
              <button
                type="button"
                onClick={addPartnerTag}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-4 py-2 rounded-xl transition-colors font-semibold"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {partnerForm.tags.map((tag) => (
                <span key={tag} className="flex items-center gap-1 bg-white/10 text-xs px-2.5 py-1 rounded-full text-white/70">
                  {tag}
                  <button type="button" onClick={() => removePartnerTag(tag)} className="text-white/40 hover:text-red-400 transition-colors">×</button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-3">
              <span className="text-sm text-white/60">Visible on site</span>
              <button
                type="button"
                onClick={() => setPartnerForm((f) => ({ ...f, active: !f.active }))}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${partnerForm.active ? 'bg-green-500/20 text-green-300' : 'bg-white/10 text-white/50'}`}
              >
                {partnerForm.active ? 'Active' : 'Hidden'}
              </button>
            </div>
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-500 text-white py-3 px-8 rounded-xl font-semibold transition-colors"
            >
              {partnerView === 'edit' ? 'Update Partner' : 'Add Partner'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  /* ──────────────── LIST VIEW ──────────────── */
  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white">
      <header className="border-b border-white/10 bg-[#0d0d1a]/95 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <Image src="/logo.svg" alt="Market Signals24" width={28} height={28} />
              <span className="font-bold">Market Signals24</span>
              <span className="text-white/30">/</span>
              <span className="text-violet-400 text-sm">Admin</span>
            </div>
            {/* Tabs */}
            <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1 ml-2">
              <button
                onClick={() => setAdminTab('blog')}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${adminTab === 'blog' ? 'bg-violet-600 text-white' : 'text-white/50 hover:text-white'}`}
              >
                Blog
              </button>
              <button
                onClick={() => setAdminTab('partners')}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${adminTab === 'partners' ? 'bg-emerald-600 text-white' : 'text-white/50 hover:text-white'}`}
              >
                Partners
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" target="_blank" className="text-white/50 hover:text-white text-sm transition-colors flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              View Site
            </Link>
            <button onClick={handleLogout} className="text-white/40 hover:text-red-400 text-sm transition-colors">
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* ── BLOG TAB ── */}
        {adminTab === 'blog' && (
          <>
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Articles', value: allPostsForDisplay.length },
            { label: 'Published', value: allPostsForDisplay.filter((p) => p.published).length },
            { label: 'Drafts', value: allPostsForDisplay.filter((p) => !p.published).length },
            { label: 'Categories', value: new Set(allPostsForDisplay.map((p) => p.category)).size },
          ].map((s) => (
            <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-2xl font-bold text-violet-400">{s.value}</p>
              <p className="text-white/50 text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Header row */}
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-xl font-bold">Articles</h1>
          <button
            onClick={() => { setForm(emptyForm()); setEditId(null); setView('new'); }}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Article
          </button>
        </div>

        {/* Save notification */}
        {saveMsg && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm rounded-xl px-4 py-3 mb-5 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {saveMsg}
          </div>
        )}

        {/* Table */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 border-b border-white/10 text-xs text-white/40 font-medium uppercase tracking-wider">
            <div className="col-span-5">Title</div>
            <div className="col-span-2">Category</div>
            <div className="col-span-2">Author</div>
            <div className="col-span-1">Date</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-1">Actions</div>
          </div>
          {allPostsForDisplay.length === 0 && (
            <div className="py-16 text-center text-white/30 text-sm">No articles yet.</div>
          )}
          {allPostsForDisplay.map((post, i) => {
            const isStatic = BLOG_POSTS.some((sp) => sp.id === post.id);
            return (
              <div
                key={post.id}
                className={`grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-5 py-4 items-center ${
                  i !== allPostsForDisplay.length - 1 ? 'border-b border-white/5' : ''
                }`}
              >
                <div className="md:col-span-5">
                  <p className="font-medium text-sm leading-snug">{post.title}</p>
                  <p className="text-white/30 text-xs mt-0.5">/{post.slug}</p>
                </div>
                <div className="md:col-span-2">
                  <span className="text-xs text-white/50">{post.category}</span>
                </div>
                <div className="md:col-span-2">
                  <span className="text-xs text-white/50">{post.author}</span>
                </div>
                <div className="md:col-span-1">
                  <span className="text-xs text-white/40">
                    {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                  </span>
                </div>
                <div className="md:col-span-1">
                  {isStatic ? (
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">Live</span>
                  ) : (
                    <button
                      onClick={() => togglePublish(post.id)}
                      className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
                        post.published ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/40'
                      }`}
                    >
                      {post.published ? 'Published' : 'Draft'}
                    </button>
                  )}
                </div>
                <div className="md:col-span-1 flex items-center gap-2">
                  <Link
                    href={`/blog/${post.slug}`}
                    target="_blank"
                    className="text-white/30 hover:text-violet-400 transition-colors"
                    title="View"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </Link>
                  {!isStatic && (
                    <>
                      <button
                        onClick={() => handleEdit(post)}
                        className="text-white/30 hover:text-blue-400 transition-colors"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="text-white/30 hover:text-red-400 transition-colors"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
          </>
        )}

        {/* ── PARTNERS TAB ── */}
        {adminTab === 'partners' && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
              {[
                { label: 'Total Partners', value: partners.length },
                { label: 'Active', value: partners.filter((p) => p.active).length },
                { label: 'Hidden', value: partners.filter((p) => !p.active).length },
              ].map((s) => (
                <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <p className="text-2xl font-bold text-emerald-400">{s.value}</p>
                  <p className="text-white/50 text-xs mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mb-5">
              <div>
                <h1 className="text-xl font-bold">Partenaires de confiance</h1>
                <p className="text-white/40 text-xs mt-0.5">Partners added here appear on the homepage below the hardcoded ones.</p>
              </div>
              <button
                onClick={() => { setPartnerForm(emptyPartner()); setPartnerEditId(null); setPartnerView('new'); }}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Partner
              </button>
            </div>

            {partnerSaveMsg && (
              <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm rounded-xl px-4 py-3 mb-5 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {partnerSaveMsg}
              </div>
            )}

            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              {partners.length === 0 && (
                <div className="py-16 text-center text-white/30 text-sm">No custom partners yet. Click &quot;Add Partner&quot; to add one.</div>
              )}
              {partners.map((partner, i) => (
                <div
                  key={partner.id}
                  className={`flex items-center gap-4 px-5 py-4 ${i !== partners.length - 1 ? 'border-b border-white/5' : ''}`}
                >
                  <div className={`w-9 h-9 rounded-xl ${partner.color} flex items-center justify-center text-white font-bold text-xs shrink-0`}>
                    {partner.initial || partner.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{partner.name}</p>
                    <p className="text-white/40 text-xs truncate">{partner.url}</p>
                    {partner.score && <span className="text-[10px] text-yellow-400">★ {partner.score}</span>}
                  </div>
                  <div className="hidden sm:block text-xs text-white/40 max-w-xs truncate">{partner.subtitle}</div>
                  <button
                    onClick={() => togglePartnerActive(partner.id)}
                    className={`text-xs px-2.5 py-1 rounded-full transition-colors shrink-0 ${partner.active ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/40'}`}
                  >
                    {partner.active ? 'Active' : 'Hidden'}
                  </button>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handlePartnerEdit(partner)}
                      className="text-white/30 hover:text-blue-400 transition-colors"
                      title="Edit"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handlePartnerDelete(partner.id)}
                      className="text-white/30 hover:text-red-400 transition-colors"
                      title="Delete"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <p className="text-center text-white/20 text-xs mt-8">
          Market Signals24 Admin • {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
