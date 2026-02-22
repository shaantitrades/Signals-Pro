# 🔧 PLAN DE RÉPARATION - SignalsPro

## ⚠️ PROBLÈMES CRITIQUES (depuis 2 jours)

### 1. BASE DE DONNÉES SUPABASE - CONNEXION IMPOSSIBLE
**Erreur:** `FATAL: Tenant or user not found`  
**Impact:** Backend non fonctionnel, aucune donnée persistée

### 2. ERREURS NEXT.JS SERVER ACTIONS
**Erreur:** `Failed to find Server Action "x"` + `Cannot read properties of undefined (reading 'workers')`  
**Impact:** Frontend instable, fonctionnalités cassées

### 3. SÉCURITÉ COMPROMISE
**Problème:** Identifiants Supabase exposés publiquement dans `.env.production`  
**Impact:** CRITIQUE - Base de données accessible à tous

---

## 📋 PLAN D'ACTION ÉTAPE PAR ÉTAPE

### ÉTAPE 1: SÉCURISER LES IDENTIFIANTS (URGENT)
**Durée: 10 minutes**

#### Actions immédiates:
1. **Réinitialiser le mot de passe Supabase:**
   - Se connecter à https://supabase.com/dashboard
   - Projet: `yvbwjasortmssdxfuxrx`
   - Settings → Database → Reset password
   - Générer un nouveau mot de passe fort (64 caractères minimum)

2. **Régénérer les clés API Supabase:**
   - Settings → API → Service Role Key → Regenerate
   - Settings → API → Anon Key → Regenerate

3. **Supprimer `.env.production` du dépôt Git:**
   ```bash
   git rm --cached .env.production
   echo ".env.production" >> .gitignore
   git add .gitignore
   git commit -m "security: remove exposed credentials"
   git push
   ```

---

### ÉTAPE 2: RECONFIGURER LA BASE DE DONNÉES
**Durée: 15 minutes**

#### Option A: Continuer avec Supabase (recommandé pour production)

1. **Vérifier l'existence du tenant:**
   - Dashboard Supabase → Vérifier que le projet existe
   - Si supprimé: créer un nouveau projet

2. **Obtenir les nouvelles credentials:**
   ```
   Host: aws-0-eu-west-1.pooler.supabase.com
   Port: 6543 (pooler) ou 5432 (direct)
   Database: postgres
   User: postgres.yvbwjasortmssdxfuxrx
   Password: [NOUVEAU_MOT_DE_PASSE]
   ```

3. **Créer un fichier `.env` local sécurisé:**
   ```bash
   cd backend
   cp .env.example .env
   nano .env
   ```

4. **Mettre à jour DATABASE_URL:**
   ```env
   DATABASE_URL="postgresql://postgres.yvbwjasortmssdxfuxrx:[NOUVEAU_PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
   DIRECT_URL="postgresql://postgres.yvbwjasortmssdxfuxrx:[NOUVEAU_PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:5432/postgres"
   ```

5. **Exécuter les migrations:**
   ```bash
   cd backend
   npx prisma migrate deploy
   npx prisma generate
   ```

#### Option B: Basculer vers PostgreSQL local (développement)

Si Supabase pose trop de problèmes, utiliser la configuration Docker locale:

1. **Modifier `docker-compose.yml` pour utiliser PostgreSQL local:**
   ```bash
   docker-compose up -d postgres redis
   ```

2. **Mettre à jour DATABASE_URL:**
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/signalspro"
   ```

3. **Exécuter les migrations:**
   ```bash
   cd backend
   npx prisma migrate deploy
   npx prisma db seed
   ```

---

### ÉTAPE 3: RÉPARER LE FRONTEND NEXT.JS
**Durée: 10 minutes**

#### Problème: Cache Next.js corrompu + Server Actions manquants

1. **Nettoyer le cache Next.js:**
   ```bash
   cd frontend
   rm -rf .next
   rm -rf node_modules/.cache
   ```

2. **Vérifier qu'il n'y a pas de Server Actions:**
   ```bash
   grep -r "'use server'" src/
   ```
   ⚠️ Si des fichiers apparaissent, ils utilisent des Server Actions inexistantes.

3. **Reconstruire le frontend:**
   ```bash
   npm run build
   ```

4. **Si problème persiste, mettre à jour Next.js:**
   ```bash
   npm install next@latest react@latest react-dom@latest
   npm run build
   ```

---

### ÉTAPE 4: REDÉPLOYER LES SERVICES
**Durée: 15 minutes**

#### Sur serveur de production (VPS):

1. **Se connecter au serveur:**
   ```bash
   ssh user@62.169.24.224
   cd /path/to/signalspro
   ```

2. **Créer un `.env` sécurisé sur le serveur:**
   ```bash
   nano .env
   ```
   Coller les nouvelles credentials (NE PAS commiter ce fichier)

3. **Rebuild et redémarrer:**
   ```bash
   docker-compose -f docker-compose.prod.yml down
   docker-compose -f docker-compose.prod.yml build --no-cache
   docker-compose -f docker-compose.prod.yml up -d
   ```

4. **Vérifier les logs:**
   ```bash
   docker-compose -f docker-compose.prod.yml logs -f backend
   docker-compose -f docker-compose.prod.yml logs -f frontend
   docker-compose -f docker-compose.prod.yml logs -f signal-engine
   ```

5. **Tester la santé des services:**
   ```bash
   curl http://localhost:3001/api/health
   curl http://localhost:8000/health
   curl http://localhost:3000
   ```

---

### ÉTAPE 5: CORRECTIONS DE CODE NÉCESSAIRES

#### A. Prisma Schema - Ajouter directUrl pour Supabase Pooler

**Fichier:** `backend/prisma/schema.prisma`

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")  // ← AJOUTER CETTE LIGNE
}
```

**Raison:** Supabase Pooler (port 6543) nécessite une URL directe pour les migrations.

#### B. Backend - Améliorer la gestion d'erreur Prisma

**Fichier:** `backend/src/lib/prisma.ts`

Ajouter une gestion d'erreur de connexion:

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  errorFormat: 'minimal',
});

// Test de connexion au démarrage
prisma.$connect()
  .then(() => console.log('✅ Database connected'))
  .catch((err) => {
    console.error('❌ Database connection failed:', err.message);
    console.error('Check DATABASE_URL in .env file');
    process.exit(1);
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

#### C. Frontend - Vérifier les variables d'environnement

**Fichier:** `frontend/.env.local` (créer si n'existe pas)

```env
NEXT_PUBLIC_API_URL=http://62.169.24.224:3001/api
NEXT_PUBLIC_WS_URL=ws://62.169.24.224:3001
NEXT_PUBLIC_SIGNAL_ENGINE_URL=http://62.169.24.224:8000
```

---

## 🧪 TESTS DE VALIDATION

Après avoir appliqué les corrections, tester:

### 1. Backend
```bash
# Test connexion DB
curl http://localhost:3001/api/health

# Test création utilisateur
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test1234!","firstName":"Test","lastName":"User"}'
```

### 2. Frontend
- Ouvrir http://62.169.24.224:3000
- Vérifier qu'aucune erreur dans la console
- Tester navigation entre les pages
- Vérifier que les signaux s'affichent

### 3. Signal Engine
```bash
# Test scan
curl http://localhost:8000/signals/scan/CRYPTO/M15?min_confidence=50

# Vérifier Redis
docker exec -it signalspro-redis-1 redis-cli KEYS "*"
```

---

## 📊 CHECKLIST DE RÉPARATION

### Phase 1: Sécurité (CRITIQUE)
- [ ] Réinitialiser mot de passe Supabase
- [ ] Régénérer clés API Supabase
- [ ] Supprimer `.env.production` du Git
- [ ] Ajouter `.env*` au `.gitignore`
- [ ] Créer `.env` local sécurisé (non versionné)

### Phase 2: Base de données
- [ ] Vérifier existence du projet Supabase
- [ ] Obtenir nouvelles credentials
- [ ] Mettre à jour DATABASE_URL et DIRECT_URL
- [ ] Ajouter `directUrl` au schema Prisma
- [ ] Exécuter `prisma migrate deploy`
- [ ] Exécuter `prisma generate`
- [ ] Tester connexion (via prisma studio ou script)

### Phase 3: Frontend
- [ ] Nettoyer cache Next.js (`.next`)
- [ ] Vérifier absence de Server Actions
- [ ] Rebuild frontend (`npm run build`)
- [ ] Vérifier variables d'environnement
- [ ] Tester en local

### Phase 4: Déploiement
- [ ] Créer `.env` sur serveur production
- [ ] Rebuild tous les containers Docker
- [ ] Redémarrer services
- [ ] Vérifier logs (pas d'erreurs)
- [ ] Tester endpoints API

### Phase 5: Validation
- [ ] Backend /api/health retourne 200
- [ ] Frontend accessible sans erreurs console
- [ ] Signaux s'affichent sur dashboard
- [ ] Authentification fonctionne
- [ ] Redis cache opérationnel

---

## 🚨 SI LE PROBLÈME PERSISTE

### Option 1: Reset complet Supabase
```bash
# 1. Sauvegarder les données (si accessibles)
pg_dump [DATABASE_URL] > backup.sql

# 2. Créer nouveau projet Supabase
# Via dashboard: New Project

# 3. Reconfigurer avec nouvelles credentials
# 4. Restaurer données
psql [NEW_DATABASE_URL] < backup.sql
```

### Option 2: Migration vers PostgreSQL auto-hébergé
```bash
# 1. Utiliser docker-compose.yml (PostGIS/TimescaleDB)
docker-compose up -d postgres

# 2. Mettre à jour DATABASE_URL
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/signalspro"

# 3. Migrer
npx prisma migrate deploy
```

---

## 📞 SUPPORT

Si le problème persiste après avoir suivi ce plan:

1. **Vérifier les logs détaillés:**
   ```bash
   docker-compose logs backend | grep -i error
   docker-compose logs frontend | grep -i error
   ```

2. **Exporter les logs:**
   ```bash
   docker-compose logs > full_logs.txt
   ```

3. **Analyser avec moi les logs complets**

---

## 💡 PRÉVENTION FUTURE

### 1. Utiliser des secrets managés
- Ne JAMAIS commiter `.env` ou `.env.production`
- Utiliser des gestionnaires de secrets (GitHub Secrets, Vault, etc.)

### 2. Monitoring
- Implémenter Sentry pour tracking d'erreurs
- Ajouter logs structurés (Winston, Pino)
- Configurer alertes (Uptime Robot, Better Stack)

### 3. Tests automatisés
- Tests d'intégration DB
- Tests E2E frontend
- Health checks automatiques

### 4. Documentation
- Documenter la procédure de déploiement
- Maintenir un changelog
- Documenter les variables d'environnement requises

---

## ⏱️ TEMPS ESTIMÉ TOTAL: 1h - 1h30

**Priorité absolue:** Étapes 1 et 2 (sécurité + database)  
**Suivis:** Étapes 3, 4, 5

Bonne chance ! 🚀
