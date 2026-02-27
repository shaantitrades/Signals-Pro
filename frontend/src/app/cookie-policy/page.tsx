import Link from 'next/link';

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#1a1a2e] via-[#2d1b69] to-[#1a1a2e] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors mb-6">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            ← Retour
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold">Politique de Cookies</h1>
          <p className="text-white/60 mt-2">Dernière mise à jour : 27 février 2026</p>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="space-y-8">

          <section className="signal-card p-6 sm:p-8">
            <p className="text-muted-foreground leading-relaxed">
              Market Signals24 utilise des cookies et des technologies similaires pour améliorer votre expérience, analyser le trafic de notre site et
              personnaliser le contenu. Cette politique explique ce que sont les cookies, comment nous les utilisons, et comment vous pouvez les gérer.
            </p>
          </section>

          {/* 1. Qu'est-ce qu'un cookie ? */}
          <section className="signal-card p-6 sm:p-8">
            <h2 className="text-xl font-bold mb-4">1. Qu&apos;est-ce qu&apos;un cookie ?</h2>
            <p className="text-muted-foreground leading-relaxed">
              Un cookie est un petit fichier texte stocké sur votre appareil (ordinateur, smartphone, tablette) lorsque vous visitez un site web.
              Les cookies permettent au site de mémoriser vos actions et préférences (telles que la langue, l&apos;affichage, le thème)
              pendant une période donnée, pour que vous n&apos;ayez pas à les saisir à nouveau chaque fois que vous revenez sur le site.
            </p>
          </section>

          {/* 2. Types de cookies */}
          <section className="signal-card p-6 sm:p-8">
            <h2 className="text-xl font-bold mb-4">2. Types de cookies utilisés</h2>

            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-profit mb-2">Cookies strictement nécessaires</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Ces cookies sont essentiels au fonctionnement du site. Ils permettent la navigation, l&apos;authentification,
                  la sécurité et l&apos;accès aux zones sécurisées. Sans ces cookies, le site ne peut pas fonctionner correctement.
                </p>
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 pr-4 font-medium">Cookie</th>
                        <th className="text-left py-2 pr-4 font-medium">Finalité</th>
                        <th className="text-left py-2 font-medium">Durée</th>
                      </tr>
                    </thead>
                    <tbody className="text-muted-foreground">
                      <tr className="border-b border-border/50">
                        <td className="py-2 pr-4 font-mono text-xs">accessToken</td>
                        <td className="py-2 pr-4">Authentification de session</td>
                        <td className="py-2">15 min</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2 pr-4 font-mono text-xs">refreshToken</td>
                        <td className="py-2 pr-4">Renouvellement de session</td>
                        <td className="py-2">7 jours</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2 pr-4 font-mono text-xs">cookie-consent</td>
                        <td className="py-2 pr-4">Mémoriser votre choix cookies</td>
                        <td className="py-2">1 an</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-primary mb-2">Cookies de préférences</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Ces cookies mémorisent vos choix et préférences pour personnaliser votre expérience.
                </p>
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 pr-4 font-medium">Cookie</th>
                        <th className="text-left py-2 pr-4 font-medium">Finalité</th>
                        <th className="text-left py-2 font-medium">Durée</th>
                      </tr>
                    </thead>
                    <tbody className="text-muted-foreground">
                      <tr className="border-b border-border/50">
                        <td className="py-2 pr-4 font-mono text-xs">theme</td>
                        <td className="py-2 pr-4">Thème d&apos;affichage (clair/sombre)</td>
                        <td className="py-2">1 an</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2 pr-4 font-mono text-xs">lang</td>
                        <td className="py-2 pr-4">Langue préférée</td>
                        <td className="py-2">1 an</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2 pr-4 font-mono text-xs">pwa-install-dismissed</td>
                        <td className="py-2 pr-4">Bannière d&apos;installation masquée</td>
                        <td className="py-2">7 jours</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-[#f59e0b] mb-2">Cookies analytiques</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Ces cookies nous aident à comprendre comment les visiteurs utilisent notre site en collectant des informations
                  de manière anonyme. Ils nous permettent d&apos;améliorer continuellement notre plateforme.
                </p>
                <p className="text-muted-foreground text-sm mt-2">
                  Actuellement, Market Signals24 n&apos;utilise pas de cookies analytiques tiers. Si nous en intégrons à l&apos;avenir,
                  cette politique sera mise à jour et votre consentement sera demandé.
                </p>
              </div>
            </div>
          </section>

          {/* 3. Base légale */}
          <section className="signal-card p-6 sm:p-8">
            <h2 className="text-xl font-bold mb-4">3. Base légale</h2>
            <p className="text-muted-foreground leading-relaxed">
              Conformément au Règlement Général sur la Protection des Données (RGPD) et à la directive ePrivacy :
            </p>
            <ul className="mt-3 space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-profit mt-1">•</span>
                <span><strong>Cookies nécessaires :</strong> déposés sans consentement car indispensables au fonctionnement du service.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span><strong>Cookies de préférences :</strong> déposés sur la base de votre consentement explicite.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#f59e0b] mt-1">•</span>
                <span><strong>Cookies analytiques :</strong> déposés uniquement après votre consentement.</span>
              </li>
            </ul>
          </section>

          {/* 4. Gestion des cookies */}
          <section className="signal-card p-6 sm:p-8">
            <h2 className="text-xl font-bold mb-4">4. Comment gérer vos cookies</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Vous pouvez à tout moment modifier vos préférences en matière de cookies :
            </p>
            <div className="space-y-3 text-muted-foreground text-sm">
              <div className="flex items-start gap-2">
                <span className="font-bold text-foreground">a.</span>
                <span><strong>Via notre bannière :</strong> en supprimant le cookie <code className="text-xs bg-secondary px-1.5 py-0.5 rounded">cookie-consent</code> de votre navigateur, la bannière réapparaîtra lors de votre prochaine visite.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-foreground">b.</span>
                <span><strong>Via votre navigateur :</strong> la plupart des navigateurs permettent de bloquer ou supprimer les cookies dans les paramètres de confidentialité.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-foreground">c.</span>
                <span><strong>Remarque :</strong> la désactivation de certains cookies peut affecter le fonctionnement du site (déconnexion, perte de préférences).</span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-secondary/50 rounded-lg">
              <p className="text-sm font-medium mb-2">Liens utiles pour gérer les cookies dans votre navigateur :</p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Chrome</a></li>
                <li>• <a href="https://support.mozilla.org/fr/kb/cookies-informations-sites-enregistrent" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Mozilla Firefox</a></li>
                <li>• <a href="https://support.apple.com/fr-fr/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Safari</a></li>
                <li>• <a href="https://support.microsoft.com/fr-fr/microsoft-edge/supprimer-les-cookies-dans-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Microsoft Edge</a></li>
              </ul>
            </div>
          </section>

          {/* 5. Durée de conservation */}
          <section className="signal-card p-6 sm:p-8">
            <h2 className="text-xl font-bold mb-4">5. Durée de conservation</h2>
            <p className="text-muted-foreground leading-relaxed">
              Les cookies sont conservés pour la durée indiquée dans les tableaux ci-dessus. Les cookies de session
              sont supprimés à la fermeture de votre navigateur. Les cookies persistants restent sur votre appareil
              jusqu&apos;à leur expiration ou jusqu&apos;à ce que vous les supprimiez manuellement.
            </p>
          </section>

          {/* 6. Transfert de données */}
          <section className="signal-card p-6 sm:p-8">
            <h2 className="text-xl font-bold mb-4">6. Transfert de données</h2>
            <p className="text-muted-foreground leading-relaxed">
              Les données collectées via les cookies strictement nécessaires et de préférences restent sur votre appareil
              (stockage local) et ne sont pas transmises à des tiers. Aucune donnée de cookie n&apos;est vendue, louée ou
              partagée avec des tiers à des fins commerciales.
            </p>
          </section>

          {/* 7. Modifications */}
          <section className="signal-card p-6 sm:p-8">
            <h2 className="text-xl font-bold mb-4">7. Modifications de cette politique</h2>
            <p className="text-muted-foreground leading-relaxed">
              Nous pouvons mettre à jour cette politique de cookies de temps en temps. Toute modification sera publiée
              sur cette page avec une date de mise à jour révisée. Nous vous encourageons à consulter régulièrement cette
              page pour rester informé de notre utilisation des cookies.
            </p>
          </section>

          {/* 8. Contact */}
          <section className="signal-card p-6 sm:p-8">
            <h2 className="text-xl font-bold mb-4">8. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              Pour toute question concernant notre utilisation des cookies, vous pouvez nous contacter à :
            </p>
            <p className="mt-2 text-primary font-medium">contact@marketsignals24.com</p>
          </section>

        </div>

        {/* Footer links */}
        <div className="mt-12 flex flex-wrap gap-4 text-sm text-muted-foreground">
          <Link href="/privacy-policy" className="hover:text-primary transition-colors">Politique de confidentialité</Link>
          <span>•</span>
          <Link href="/terms-conditions" className="hover:text-primary transition-colors">Conditions d&apos;utilisation</Link>
          <span>•</span>
          <Link href="/legal-notice" className="hover:text-primary transition-colors">Mentions légales</Link>
        </div>
      </main>
    </div>
  );
}
