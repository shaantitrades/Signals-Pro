# SignalsPro - Professional Trading Signals Platform

## 🎯 Overview
SignalsPro is a professional-grade trading signals platform featuring triple-validated signal generation (AI + Human + Market Confirmation), dual-core interface (Trading Bot Center + Live Signals Dashboard), and comprehensive anti-fake signal protection.

## 🏗️ Architecture
```
signals-pro/
├── frontend/          # Next.js 14 + Tailwind + shadcn/ui
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

## 📝 License
Proprietary - All rights reserved.
