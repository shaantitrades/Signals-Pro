# 🏗️ Architecture Technique Détaillée - SignalsPro Platform

## 1. Vue d'Ensemble de l'Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                                 │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │  Next.js 14 App  │  │  Mobile (PWA)    │  │  Admin Panel     │  │
│  │  - Bot Center    │  │  - Push Notifs   │  │  - Signal Mgmt   │  │
│  │  - Dashboard     │  │  - Quick View    │  │  - User Mgmt     │  │
│  │  - Settings      │  │  - Auto-Trade    │  │  - Analytics      │  │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘  │
└───────────┼──────────────────────┼──────────────────────┼───────────┘
            │                      │                      │
            ▼                      ▼                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      API GATEWAY (Nginx)                            │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  Rate Limiting │ Auth │ Load Balancing │ SSL Termination    │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────┬───────────────────────────────────────┘
                              │
┌─────────────────────────────┼───────────────────────────────────────┐
│                      BACKEND LAYER                                  │
│                              │                                      │
│  ┌──────────────────┐  ┌────┴─────────────┐  ┌──────────────────┐  │
│  │  REST API        │  │  WebSocket Server│  │  Signal Engine   │  │
│  │  (Node.js +      │  │  (Socket.IO)     │  │  (Python)        │  │
│  │   Express)       │  │  - Real-time     │  │  - ML Models     │  │
│  │  - Auth          │  │  - Notifications │  │  - Data Pipeline │  │
│  │  - CRUD          │  │  - Live Signals  │  │  - Backtesting   │  │
│  │  - Payments      │  │  - Status Updates│  │  - Scoring       │  │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘  │
│           │                      │                      │           │
│  ┌────────┴──────────────────────┴──────────────────────┴────────┐  │
│  │                    MESSAGE BROKER (Redis)                      │  │
│  │  Pub/Sub │ Caching │ Session Store │ Rate Limiting             │  │
│  └───────────────────────────────┬───────────────────────────────┘  │
└──────────────────────────────────┼──────────────────────────────────┘
                                   │
┌──────────────────────────────────┼──────────────────────────────────┐
│                       DATA LAYER                                    │
│  ┌──────────────────┐  ┌────────┴─────────┐  ┌──────────────────┐  │
│  │  PostgreSQL      │  │  Redis Cache     │  │  TimescaleDB     │  │
│  │  - Users         │  │  - Sessions      │  │  - Price History │  │
│  │  - Signals       │  │  - Active Signals│  │  - Tick Data     │  │
│  │  - Trades        │  │  - Leaderboard   │  │  - Analytics     │  │
│  │  - Subscriptions │  │  - Rate Limits   │  │  - Performance   │  │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                   │
┌──────────────────────────────────┼──────────────────────────────────┐
│                    EXTERNAL SERVICES                                │
│  ┌─────────┐ ┌─────────┐ ┌──────┴──┐ ┌─────────┐ ┌─────────────┐  │
│  │TradingVw│ │CoinMktCp│ │Alpha    │ │Stripe   │ │ Broker APIs │  │
│  │Widget   │ │API      │ │Vantage  │ │Payments │ │ (MT4/MT5)   │  │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

## 2. Stack Technique

### Frontend
- **Framework** : Next.js 14 (App Router) + TypeScript
- **Styling** : Tailwind CSS 3.4 + shadcn/ui
- **State** : Zustand (global) + React Query (server state)
- **Charts** : TradingView Lightweight Charts + Recharts
- **Real-time** : Socket.IO Client
- **Forms** : React Hook Form + Zod

### Backend
- **API** : Node.js 20 + Express.js + TypeScript
- **Signal Engine** : Python 3.12 + FastAPI
- **ORM** : Prisma (Node.js) + SQLAlchemy (Python)
- **Auth** : JWT + Refresh Tokens + bcrypt
- **Validation** : Zod (API) + Pydantic (Python)

### Data
- **Primary DB** : PostgreSQL 16 
- **Time Series** : TimescaleDB extension
- **Cache/Pub-Sub** : Redis 7
- **Queue** : Bull (Node.js job queue)

### Infrastructure
- **Frontend** : Vercel (Edge Functions)
- **Backend** : AWS ECS / DigitalOcean App Platform
- **Database** : AWS RDS / Supabase
- **CI/CD** : GitHub Actions
- **Monitoring** : Datadog + Sentry

## 3. Flux de Données

### Signal Generation Flow
```
Market Data Feed → Data Pipeline → Feature Extraction → ML Model Prediction
    ↓                                                          ↓
Technical Indicators ──────────────────────────────→ Confidence Score
    ↓                                                          ↓
Sentiment Analysis ────────────────────────────────→ Market Context
    ↓                                                          ↓
Volume/Order Flow ─────────────────────────────────→ Validation Layer
                                                               ↓
                                                    Triple Validation
                                                    ├── Level 1: AI Score ≥ 85%
                                                    ├── Level 2: Human Validator
                                                    └── Level 3: Market Confirmation
                                                               ↓
                                                    Signal Published
                                                    ├── WebSocket → Dashboard
                                                    ├── Push Notification
                                                    └── Auto-Execute (Bot)
```

## 4. Schéma de Base de Données

Voir `database/schema.prisma` pour le schéma complet.

## 5. API Endpoints

### Auth
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Déconnexion

### Signals
- `GET /api/signals` - Liste des signaux (filtres, pagination)
- `GET /api/signals/:id` - Détail d'un signal
- `GET /api/signals/active` - Signaux actifs en cours
- `POST /api/signals` - Créer un signal (admin/validator)
- `PATCH /api/signals/:id` - Mettre à jour un signal
- `DELETE /api/signals/:id` - Supprimer un signal

### Bot
- `POST /api/bot/start` - Démarrer le bot pour un asset
- `POST /api/bot/stop` - Arrêter le bot
- `GET /api/bot/status` - Statut du bot
- `GET /api/bot/config` - Configuration du bot
- `PUT /api/bot/config` - Modifier config du bot

### User Trades
- `GET /api/trades` - Historique des trades
- `GET /api/trades/stats` - Statistiques de trading
- `POST /api/trades` - Enregistrer un trade

### Validation
- `GET /api/validation/pending` - Signaux en attente de validation
- `POST /api/validation/:signalId` - Valider/rejeter un signal
- `GET /api/validation/stats` - Statistiques de validation

### Subscriptions
- `GET /api/subscriptions/plans` - Plans disponibles
- `POST /api/subscriptions/create` - Créer un abonnement
- `POST /api/subscriptions/cancel` - Annuler
- `GET /api/subscriptions/status` - Statut actuel

### Performance
- `GET /api/performance/global` - Performance globale
- `GET /api/performance/by-asset` - Par asset
- `GET /api/performance/by-timeframe` - Par timeframe
- `GET /api/performance/leaderboard` - Classement

## 6. Sécurité

- HTTPS everywhere (TLS 1.3)
- JWT avec rotation des tokens (access: 15min, refresh: 7 jours)
- Rate limiting (100 req/min API, 10 req/min auth)
- Input validation (Zod + SQL injection prevention via Prisma)
- CORS restrictif
- Helmet.js headers
- API key rotation pour services externes
- Audit log complet pour toutes les actions admin

## 7. Performance & Scalabilité

### Cibles :
- Latence signal < 100ms (WebSocket)
- API response < 200ms (p95)
- 10,000 connexions WebSocket simultanées
- 99.9% uptime (< 8.7h downtime/an)

### Strategies :
- Redis caching (signaux actifs, leaderboard)
- Database connection pooling (PgBouncer)
- CDN pour assets statiques (Vercel Edge)
- Horizontal scaling backend (load balanced)
- Database read replicas pour analytics
