'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/api\d*\/?$/, '').replace(/\/+$/, '');
const SIGNAL_ENGINE_URL = process.env.NEXT_PUBLIC_SIGNAL_ENGINE_URL || 'http://localhost:8000';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  createdAt: string;
  subscription: {
    id: string;
    status: string;
    currentPeriodEnd: string;
    plan: { name: string; slug: string; durationDays: number };
  } | null;
}

interface Plan {
  id: string;
  name: string;
  slug: string;
  durationDays: number;
  priceEur: number;
}

interface DeepSeekStatus {
  available: boolean;
  enabled: boolean;
  consecutive_fails: number;
  last_fail: string | null;
  last_ok: string | null;
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    ACTIVE: 'bg-green-500/15 text-green-400 border-green-500/30',
    TRIAL: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    EXPIRED: 'bg-red-500/15 text-red-400 border-red-500/30',
    CANCELED: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    PENDING: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  };
  return map[status] || 'bg-secondary text-muted-foreground border-border';
}

export default function AdminPage() {
  const { user } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [deepSeekStatus, setDeepSeekStatus] = useState<DeepSeekStatus | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const [activateModal, setActivateModal] = useState<{ user: User } | null>(null);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [customDays, setCustomDays] = useState('');

  const getToken = () => {
    try { return localStorage.getItem('accessToken') || ''; } catch { return ''; }
  };

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchUsers = useCallback(async (q = '') => {
    try {
      const res = await fetch(`${API_URL}/api/admin/users${q ? `?search=${encodeURIComponent(q)}` : ''}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (data.success) setUsers(data.data);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  const fetchPlans = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/plans`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (data.success) setPlans(data.data);
    } catch { /* ignore */ }
  }, []);

  const fetchDeepSeekStatus = useCallback(async () => {
    try {
      const res = await fetch(`${SIGNAL_ENGINE_URL}/signals/deepseek-status`);
      if (res.ok) setDeepSeekStatus(await res.json());
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchPlans();
    fetchDeepSeekStatus();
    const interval = setInterval(fetchDeepSeekStatus, 30_000);
    return () => clearInterval(interval);
  }, [fetchUsers, fetchPlans, fetchDeepSeekStatus]);

  useEffect(() => {
    const t = setTimeout(() => fetchUsers(search), 400);
    return () => clearTimeout(t);
  }, [search, fetchUsers]);

  const handleActivate = async () => {
    if (!activateModal || !selectedPlan) return;
    setActionLoading(activateModal.user.id);
    try {
      const body: Record<string, unknown> = {
        userId: activateModal.user.id,
        planSlug: selectedPlan,
      };
      if (customDays && Number(customDays) > 0) body.days = Number(customDays);

      const res = await fetch(`${API_URL}/api/admin/activate-subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`✅ ${data.message}`, 'success');
        setActivateModal(null);
        fetchUsers(search);
      } else {
        showToast(`❌ ${data.error}`, 'error');
      }
    } catch {
      showToast('❌ Erreur réseau', 'error');
    }
    setActionLoading(null);
  };

  const handleRevoke = async (u: User) => {
    if (!confirm(`Révoquer l'abonnement de ${u.email} ?`)) return;
    setActionLoading(u.id);
    try {
      const res = await fetch(`${API_URL}/api/admin/revoke-subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ userId: u.id }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('✅ Abonnement révoqué', 'success');
        fetchUsers(search);
      } else {
        showToast(`❌ ${data.error}`, 'error');
      }
    } catch {
      showToast('❌ Erreur réseau', 'error');
    }
    setActionLoading(null);
  };

  if (!['ADMIN', 'SUPER_ADMIN'].includes(user?.role || '')) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <div className="text-center">
          <div className="text-4xl mb-3">🔒</div>
          <p className="font-semibold">Accès réservé aux administrateurs</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Toast */}
      {toast && (
        <div className={cn(
          'fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium',
          toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        )}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-xl">⚙️</div>
        <div>
          <h1 className="text-xl font-bold">Panel Admin</h1>
          <p className="text-xs text-muted-foreground">Gestion des utilisateurs et abonnements</p>
        </div>
      </div>

      {/* DeepSeek Status Banner */}
      {deepSeekStatus && (
        <div className={cn(
          'flex items-center gap-3 p-4 rounded-xl border text-sm',
          !deepSeekStatus.enabled
            ? 'bg-secondary/50 border-border text-muted-foreground'
            : deepSeekStatus.available
              ? 'bg-green-500/10 border-green-500/30 text-green-400'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
        )}>
          <span className="text-2xl">
            {!deepSeekStatus.enabled ? '⚙️' : deepSeekStatus.available ? '🤖' : '⚠️'}
          </span>
          <div className="flex-1">
            <p className="font-semibold">
              DeepSeek AI —{' '}
              {!deepSeekStatus.enabled
                ? 'Désactivé (pas de clé API)'
                : deepSeekStatus.available
                  ? 'En ligne ✓'
                  : `HORS LIGNE — ${deepSeekStatus.consecutive_fails} échec(s) consécutif(s)`}
            </p>
            {deepSeekStatus.last_fail && (
              <p className="text-xs opacity-70">
                Dernier échec : {new Date(deepSeekStatus.last_fail).toLocaleString('fr-FR')}
                {deepSeekStatus.last_ok && ` — Dernier OK : ${new Date(deepSeekStatus.last_ok).toLocaleString('fr-FR')}`}
              </p>
            )}
            {!deepSeekStatus.available && (
              <p className="text-xs mt-1 font-medium">
                ℹ️ Les signaux continuent de fonctionner normalement (auto-confirmés)
              </p>
            )}
          </div>
          <button
            onClick={fetchDeepSeekStatus}
            className="text-xs opacity-60 hover:opacity-100 transition-opacity"
            title="Rafraîchir"
          >
            🔄
          </button>
        </div>
      )}

      {/* User Management */}
      <div className="signal-card">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-semibold">Utilisateurs ({users.length})</h2>
          <input
            type="text"
            placeholder="Rechercher par email, prénom..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-secondary text-sm rounded-lg px-3 py-1.5 border border-border focus:outline-none focus:border-primary w-64"
          />
        </div>

        {loading ? (
          <div className="p-8 text-center text-muted-foreground text-sm">Chargement...</div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">Aucun utilisateur trouvé</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-xs">
                  <th className="text-left p-3 font-medium">Utilisateur</th>
                  <th className="text-left p-3 font-medium">Rôle</th>
                  <th className="text-left p-3 font-medium">Abonnement</th>
                  <th className="text-left p-3 font-medium">Expire</th>
                  <th className="text-left p-3 font-medium">Inscrit le</th>
                  <th className="text-right p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                    <td className="p-3">
                      <div className="font-medium">{u.firstName} {u.lastName}</div>
                      <div className="text-xs text-muted-foreground">{u.email}</div>
                    </td>
                    <td className="p-3">
                      <span className={cn(
                        'px-2 py-0.5 rounded text-[10px] font-bold border',
                        u.role === 'ADMIN' || u.role === 'SUPER_ADMIN'
                          ? 'bg-purple-500/15 text-purple-400 border-purple-500/30'
                          : 'bg-secondary text-muted-foreground border-border'
                      )}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3">
                      {u.subscription ? (
                        <div>
                          <span className={cn('px-2 py-0.5 rounded text-[10px] font-bold border', statusBadge(u.subscription.status))}>
                            {u.subscription.status}
                          </span>
                          <div className="text-xs text-muted-foreground mt-0.5">{u.subscription.plan.name}</div>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">Aucun</span>
                      )}
                    </td>
                    <td className="p-3 text-xs text-muted-foreground">
                      {u.subscription?.currentPeriodEnd
                        ? new Date(u.subscription.currentPeriodEnd).toLocaleDateString('fr-FR')
                        : '—'}
                    </td>
                    <td className="p-3 text-xs text-muted-foreground">
                      {new Date(u.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setActivateModal({ user: u });
                            setSelectedPlan(plans[0]?.slug || '');
                            setCustomDays('');
                          }}
                          disabled={actionLoading === u.id}
                          className="px-3 py-1 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                        >
                          Activer
                        </button>
                        {u.subscription && u.subscription.status === 'ACTIVE' && (
                          <button
                            onClick={() => handleRevoke(u)}
                            disabled={actionLoading === u.id}
                            className="px-3 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                          >
                            Révoquer
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Activate Modal */}
      {activateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="font-bold text-lg mb-1">Activer un abonnement</h3>
            <p className="text-sm text-muted-foreground mb-5">
              Pour : <span className="font-medium text-foreground">{activateModal.user.email}</span>
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Plan</label>
                <select
                  value={selectedPlan}
                  onChange={(e) => setSelectedPlan(e.target.value)}
                  className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                >
                  {plans.map((p) => (
                    <option key={p.slug} value={p.slug}>
                      {p.name} — {p.durationDays}j — {p.priceEur}€
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  Durée personnalisée (jours) — laisser vide pour utiliser la durée du plan
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder={`Par défaut : ${plans.find((p) => p.slug === selectedPlan)?.durationDays ?? '?'} jours`}
                  value={customDays}
                  onChange={(e) => setCustomDays(e.target.value)}
                  className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setActivateModal(null)}
                className="flex-1 py-2 rounded-lg border border-border text-sm hover:bg-secondary/50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleActivate}
                disabled={!selectedPlan || actionLoading === activateModal.user.id}
                className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {actionLoading === activateModal.user.id ? 'En cours...' : '✅ Activer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
