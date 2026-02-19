'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/lib/store';
import { authApi, subscriptionsApi } from '@/lib/api';

export default function SettingsPage() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const { user, initAuth, hasActiveSubscription } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');

  // Read ?tab= query param on mount
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['profile', 'notifications', 'trading', 'subscription', 'security'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Profile form — initialized from user store
  const [profile, setProfile] = useState({ firstName: '', lastName: '', email: '', phone: '' });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load user data into profile form
  useEffect(() => {
    if (user) {
      setProfile({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: (user as any).phone || '',
      });
    }
  }, [user]);

  // Save profile handler
  const handleSaveProfile = async () => {
    setProfileSaving(true);
    setProfileMsg(null);
    try {
      await authApi.updateProfile({
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
      });
      await initAuth(); // refresh user data in store
      setProfileMsg({ type: 'success', text: t('settings.saveSuccess') });
    } catch (err: any) {
      setProfileMsg({ type: 'error', text: err?.response?.data?.message || t('settings.saveError') });
    } finally {
      setProfileSaving(false);
    }
  };

  // Password form
  const [passwords, setPasswords] = useState({ current: '', newPw: '', confirm: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleChangePassword = async () => {
    setPwMsg(null);
    if (passwords.newPw !== passwords.confirm) {
      setPwMsg({ type: 'error', text: t('settings.passwordMismatch') });
      return;
    }
    if (passwords.newPw.length < 8) {
      setPwMsg({ type: 'error', text: t('settings.minChars') });
      return;
    }
    setPwSaving(true);
    try {
      await authApi.changePassword({
        currentPassword: passwords.current,
        newPassword: passwords.newPw,
      });
      setPasswords({ current: '', newPw: '', confirm: '' });
      setPwMsg({ type: 'success', text: t('settings.passwordChanged') });
    } catch (err: any) {
      setPwMsg({ type: 'error', text: err?.response?.data?.message || t('settings.saveError') });
    } finally {
      setPwSaving(false);
    }
  };

  // Notification prefs
  const [notifications, setNotifications] = useState({
    newSignal: true, signalClosed: true, botStatus: true, dailyReport: false,
    emailAlerts: true, pushAlerts: true, soundAlerts: false,
  });

  // Trading prefs
  const [trading, setTrading] = useState({
    defaultRisk: 2, defaultLotSize: 0.01, autoClose: true, trailingStop: false,
    maxDailyLoss: 5, preferredCategories: ['FOREX', 'COMMODITIES'],
  });

  const tabs = [
    { value: 'profile', label: t('settings.profile'), icon: '👤' },
    { value: 'notifications', label: t('settings.notifications'), icon: '🔔' },
    { value: 'trading', label: t('settings.trading'), icon: '⚙️' },
    { value: 'subscription', label: t('settings.subscription'), icon: '💳' },
    { value: 'security', label: t('settings.security'), icon: '🔒' },
  ];

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className={cn(
        'w-10 h-5 rounded-full transition-colors relative',
        checked ? 'bg-primary' : 'bg-secondary'
      )}
    >
      <div className={cn(
        'w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform',
        checked ? 'translate-x-5.5 left-5' : 'left-0.5'
      )} />
    </button>
  );

  return (
    <div className="flex gap-6">
      {/* Settings Sidebar */}
      <div className="w-56 shrink-0 hidden md:block">
        <div className="signal-card p-2 space-y-1 sticky top-4">
          {tabs.map(tab => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors',
                activeTab === tab.value
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              )}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 space-y-6">
        {activeTab === 'profile' && (
          <div className="signal-card p-6">
            <h3 className="text-lg font-semibold mb-6">{t('settings.profileInfo')}</h3>
            <div className="space-y-4 max-w-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">{t('settings.firstName')}</label>
                  <input
                    value={profile.firstName}
                    onChange={e => setProfile(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">{t('settings.lastName')}</label>
                  <input
                    value={profile.lastName}
                    onChange={e => setProfile(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">{t('settings.email')}</label>
                <input
                  value={profile.email}
                  disabled
                  className="w-full px-4 py-2.5 bg-secondary/50 border border-border rounded-lg text-muted-foreground cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground mt-1">{t('settings.emailReadonly')}</p>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">{t('settings.phone')}</label>
                <input
                  value={profile.phone}
                  onChange={e => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="+33 6 00 00 00 00"
                />
              </div>
              {profileMsg && (
                <p className={cn('text-sm font-medium', profileMsg.type === 'success' ? 'text-profit' : 'text-loss')}>
                  {profileMsg.text}
                </p>
              )}
              <button
                onClick={handleSaveProfile}
                disabled={profileSaving}
                className="px-6 py-2.5 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {profileSaving ? '...' : t('settings.save')}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="signal-card p-6">
            <h3 className="text-lg font-semibold mb-6">{t('settings.notifPrefs')}</h3>
            <div className="space-y-6 max-w-lg">
              <div>
                <h4 className="text-sm font-medium mb-3">{t('settings.events')}</h4>
                <div className="space-y-3">
                  {[
                    { key: 'newSignal', label: t('settings.newSignal'), desc: t('settings.newSignalDesc') },
                    { key: 'signalClosed', label: t('settings.signalClosed'), desc: t('settings.signalClosedDesc') },
                    { key: 'botStatus', label: t('settings.botStatus'), desc: t('settings.botStatusDesc') },
                    { key: 'dailyReport', label: t('settings.dailyReport'), desc: t('settings.dailyReportDesc') },
                  ].map(item => (
                    <div key={item.key} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                      <Toggle
                        checked={(notifications as any)[item.key]}
                        onChange={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }))}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-3">{t('settings.channels')}</h4>
                <div className="space-y-3">
                  {[
                    { key: 'emailAlerts', label: 'Email' },
                    { key: 'pushAlerts', label: 'Push' },
                    { key: 'soundAlerts', label: t('settings.sound') },
                  ].map(item => (
                    <div key={item.key} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                      <p className="text-sm font-medium">{item.label}</p>
                      <Toggle
                        checked={(notifications as any)[item.key]}
                        onChange={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }))}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'trading' && (
          <div className="signal-card p-6">
            <h3 className="text-lg font-semibold mb-6">{t('settings.tradingPrefs')}</h3>
            <div className="space-y-4 max-w-lg">
              <div>
                <label className="text-sm font-medium mb-1 block">
                  {t('settings.riskPerTrade')} <span className="text-primary">{trading.defaultRisk}%</span>
                </label>
                <input
                  type="range" min={0.5} max={10} step={0.5}
                  value={trading.defaultRisk}
                  onChange={e => setTrading(prev => ({ ...prev, defaultRisk: Number(e.target.value) }))}
                  className="w-full accent-primary"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  {t('settings.defaultLot')} <span className="text-primary">{trading.defaultLotSize}</span>
                </label>
                <input
                  type="range" min={0.01} max={1} step={0.01}
                  value={trading.defaultLotSize}
                  onChange={e => setTrading(prev => ({ ...prev, defaultLotSize: Number(e.target.value) }))}
                  className="w-full accent-primary"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  {t('settings.dailyMaxLoss')} <span className="text-loss">{trading.maxDailyLoss}%</span>
                </label>
                <input
                  type="range" min={1} max={20} step={1}
                  value={trading.maxDailyLoss}
                  onChange={e => setTrading(prev => ({ ...prev, maxDailyLoss: Number(e.target.value) }))}
                  className="w-full accent-primary"
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">{t('settings.autoClose')}</p>
                  <p className="text-xs text-muted-foreground">{t('settings.autoCloseDesc')}</p>
                </div>
                <Toggle checked={trading.autoClose} onChange={() => setTrading(prev => ({ ...prev, autoClose: !prev.autoClose }))} />
              </div>
              <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">{t('settings.trailingStop')}</p>
                  <p className="text-xs text-muted-foreground">{t('settings.trailingStopDesc')}</p>
                </div>
                <Toggle checked={trading.trailingStop} onChange={() => setTrading(prev => ({ ...prev, trailingStop: !prev.trailingStop }))} />
              </div>
              <button className="px-6 py-2.5 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors">
                {t('settings.save')}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'subscription' && (
          <div className="signal-card p-6">
            <h3 className="text-lg font-semibold mb-6">{t('settings.currentSub')}</h3>
            <div className="max-w-lg">
              {hasActiveSubscription() && user?.subscription ? (
                <>
                  <div className="p-4 bg-gradient-to-r from-primary/10 to-signal-strong/10 rounded-xl border border-primary/20 mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-lg">{user.subscription.plan?.name || 'Plan'}</span>
                      <span className="text-primary font-bold text-xl">
                        {user.subscription.plan?.price ? `€${user.subscription.plan.price}/${user.subscription.plan?.interval === 'YEARLY' ? 'an' : 'mois'}` : ''}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{t('settings.unlimitedSignals')}</p>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-profit rounded-full" />
                      <span className="text-sm text-profit font-medium">{t('settings.active')}</span>
                      <span className="text-xs text-muted-foreground">
                        • {t('settings.renewDate')} {new Date(user.subscription.currentPeriodEnd).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <a href="/tarifs" className="block w-full py-2.5 bg-secondary text-foreground font-medium rounded-lg hover:bg-secondary/80 transition-colors text-center">
                      {t('settings.changePlan')}
                    </a>
                    <button
                      onClick={async () => {
                        if (confirm(t('settings.cancelConfirm'))) {
                          try {
                            await subscriptionsApi.cancel();
                            await initAuth();
                          } catch {}
                        }
                      }}
                      className="w-full py-2.5 text-loss hover:bg-loss/10 font-medium rounded-lg transition-colors"
                    >
                      {t('settings.cancelSub')}
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">💳</span>
                  </div>
                  <h4 className="font-bold mb-2">{t('settings.noSub')}</h4>
                  <p className="text-sm text-muted-foreground mb-6">{t('settings.noSubDesc')}</p>
                  <a
                    href="/tarifs"
                    className="inline-block px-6 py-2.5 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    {t('bot.subRequiredCta')}
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="signal-card p-6">
            <h3 className="text-lg font-semibold mb-6">{t('settings.security')}</h3>
            <div className="space-y-4 max-w-lg">
              <div>
                <label className="text-sm font-medium mb-1 block">{t('settings.currentPassword')}</label>
                <input
                  type="password"
                  value={passwords.current}
                  onChange={e => setPasswords(prev => ({ ...prev, current: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">{t('settings.newPassword')}</label>
                <input
                  type="password"
                  value={passwords.newPw}
                  onChange={e => setPasswords(prev => ({ ...prev, newPw: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder={t('settings.minChars')}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">{t('settings.confirm')}</label>
                <input
                  type="password"
                  value={passwords.confirm}
                  onChange={e => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder={t('settings.retypePassword')}
                />
              </div>
              {pwMsg && (
                <p className={cn('text-sm font-medium', pwMsg.type === 'success' ? 'text-profit' : 'text-loss')}>
                  {pwMsg.text}
                </p>
              )}
              <button
                onClick={handleChangePassword}
                disabled={pwSaving || !passwords.current || !passwords.newPw || !passwords.confirm}
                className="px-6 py-2.5 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {pwSaving ? '...' : t('settings.update')}
              </button>

              <div className="pt-6 border-t border-border">
                <h4 className="text-sm font-medium mb-3">{t('settings.activeSessions')}</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Chrome - Windows</p>
                      <p className="text-xs text-muted-foreground">{`${t('settings.lastActivity')} 2 min`}</p>
                    </div>
                    <span className="text-xs bg-profit/10 text-profit px-2 py-0.5 rounded">{t('settings.current')}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Safari - iPhone</p>
                      <p className="text-xs text-muted-foreground">{`${t('settings.lastActivity')} 3h`}</p>
                    </div>
                    <button className="text-xs text-loss hover:underline">{t('settings.disconnect')}</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
