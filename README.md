# SignalsPro - Professional Trading Signals Platform

## 🎯 Overview
SignalsPro is a professional-grade trading signals platform featuring triple-validated signal generation (AI + Human + Market Confirmation), dual-core interface (Trading Bot Center + Live Signals Dashboard), and comprehensive anti-fake signal protection.

## 🏗️ Architecture
```
signals-pro/
├── frontend/          # Next.js 16 + Tailwind + shadcn/ui
├── backend/           # Node.js + Express + TypeScript
├── signal-engine/     # Python ML signal generation
├── docs/              # Documentation & analysis
└── docker/            # Docker configuration
```

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Python 3.12+
- PostgreSQL 16+
- Redis 7+

### Installation
```bash
# 1. Clone & install root dependencies
npm install

# 2. Install frontend dependencies
cd frontend && npm install

# 3. Install backend dependencies
cd ../backend && npm install

# 4. Install signal engine dependencies
cd ../signal-engine && pip install -r requirements.txt

# 5. Setup environment
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# 6. Setup database
npm run db:migrate
npm run db:seed

# 7. Start development
npm run dev
```

## 📊 Features
- **Triple Signal Validation**: AI (85%+ confidence) → Human Validator → Market Confirmation
- **Trading Bot Center**: Auto-execute signals across Forex, Crypto, Indices, Commodities
- **Live Signals Dashboard**: Real-time monitoring with TradingView charts
- **Anti-Fake System**: Backtesting + continuous monitoring + auto-disable
- **Multi-Asset**: Forex OTC, Forex, Crypto (24/7), Indices, Commodities

## 💰 Subscription Plans
- Trial 24h: €5.90
- Weekly: €19.90
- Monthly: €99.90
- Quarterly: €259.90

## 🌍 Internationalisation (i18n) & SEO multilingue

La langue d'une page est décidée par **l'URL**, plus par le `localStorage`.

| Élément | Fichier |
| --- | --- |
| Liste des locales + helpers (hreflang, Accept-Language, cookies…) | `frontend/src/lib/locales.ts` |
| Redirection par langue, en-têtes `x-locale` / `x-pathname` | `frontend/src/middleware.ts` |
| `<html lang>` / `<html dir>`, `canonical`, hreflang | `frontend/src/app/layout.tsx` (`generateMetadata`) |
| Titres & descriptions traduits (accueil, tarifs) | `frontend/src/lib/meta.ts` |
| Dictionnaires de traduction (8 langues) | `frontend/src/lib/i18n.tsx` |
| Clusters hreflang des pages SEO | `frontend/src/lib/seo-clusters.ts` |
| Sitemap (toutes les langues + hreflang) | `frontend/src/app/sitemap.ts` |
| Points d'entrée `/{locale}/…` | `frontend/src/app/[locale]/` |

### Fonctionnement

1. `middleware.ts` redirige une fois `/` et `/tarifs`, `/login`, `/register`,
   `/forgot-password`, `/reset-password` vers la version préfixée
   (`/fr/tarifs`…). La locale est choisie dans cet ordre : cookie `NEXT_LOCALE`
   → en-tête `Accept-Language` → anglais. La redirection est un **307** pour ne
   pas être mise en cache définitivement.
2. Le middleware transmet `x-locale` et `x-pathname` au serveur : le layout
   racine rend donc `<html lang="fr">` et le `I18nProvider` démarre directement
   dans la bonne langue (le HTML envoyé à Google est déjà traduit).
3. Les URL sans préfixe (dashboard, blog, pages légales anglaises, pages SEO)
   ne sont pas redirigées : elles gardent leur langue réelle, donc jamais de
   contenu multilingue dupliqué.
4. Le sélecteur de langue change **l'URL** (`/fr/tarifs` → `/de/tarifs`).

### Ajouter une traduction

Ajouter la clé dans les 8 dictionnaires de `frontend/src/lib/i18n.tsx` et
l'utiliser via `const { t } = useI18n()` puis `t('ma.cle')`.

### Ajouter une langue

1. `LOCALES`, `LOCALE_TO_LANG`, `LANG_TO_LOCALE`, `HREFLANG`, `OG_LOCALE` et
   `languages` dans `frontend/src/lib/locales.ts`.
2. Un dictionnaire `XX: { … }` dans `frontend/src/lib/i18n.tsx`
   (+ `HOME_META` / `PRICING_META` dans `frontend/src/lib/meta.ts`).

Le reste (URL, hreflang, sitemap, redirection) est automatique.

### Pages SEO (une langue par page)

| Thème | URLs |
| --- | --- |
| Forex | `/forex-signals`, `/fr/signaux-forex`, `/es/senales-forex`, `/de/forex-signale` |
| Crypto | `/crypto-signals`, `/fr/signaux-crypto` |
| IA | `/ai-trading-signals`, `/fr/signaux-ia` |
| Trading Turbo | `/turbo-signals`, `/fr/signaux-turbo` |

Les anciennes URL `binary-options-signals` / `signaux-options-binaires` (ainsi
que les 2 liens historiques ES/DE jamais créés) sont redirigées de façon
permanente dans `frontend/next.config.js` : ne jamais réintroduire de mention
« binary options / options binaires » ni de nom de plateforme de courtage dans
le contenu ou les mots-clés.

### Vérifier

```bash
cd frontend && npm run build          # compilation + types
npx next start -p 3100
curl -I -H "Accept-Language: fr-FR" http://localhost:3100/   # 307 → /fr
curl -s http://localhost:3100/fr | grep -o '<html lang="[^"]*"'   # lang="fr"
```

## 📝 License
Proprietary - All rights reserved.
