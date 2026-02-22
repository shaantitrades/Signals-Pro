# 🚀 GUIDE RAPIDE DE RÉPARATION

## ⚡ Actions Immédiates (15-30 minutes)

### ÉTAPE 1 : Sécuriser les Credentials (URGENT) ⏱️ 5 min

1. **Connectez-vous à Supabase :**
   - Allez sur https://supabase.com/dashboard
   - Trouvez votre projet : `yvbwjasortmssdxfuxrx`
   
2. **SI le projet existe encore :**
   ```
   → Settings → Database → Reset password
   → Copiez le nouveau mot de passe
   ```

3. **SI le projet n'existe plus :**
   ```
   → Créez un nouveau projet
   → Notez les nouvelles credentials
   ```

4. **Récupérez les informations de connexion :**
   - Settings → Database → Connection String
   - Copiez les deux formats :
     - Pooler (port 6543) → pour DATABASE_URL
     - Direct (port 5432) → pour DIRECT_URL

---

### ÉTAPE 2 : Créer le fichier .env ⏱️ 5 min

Sur votre serveur (ou en local) :

```bash
cd /path/to/signalspro
cp .env.example .env
nano .env
```

**Remplissez avec vos vraies credentials :**

```env
# Domain (votre domaine ou IP)
DOMAIN=62.169.24.224

# Supabase (LES NOUVELLES!)
DATABASE_URL="postgresql://postgres.VOTRE_PROJET:NOUVEAU_MOT_DE_PASSE@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.VOTRE_PROJET:NOUVEAU_MOT_DE_PASSE@aws-0-eu-west-1.pooler.supabase.com:5432/postgres"

# Redis (générez un mot de passe fort)
REDIS_PASSWORD="votre_mot_de_passe_redis_fort"

# JWT (générez avec: openssl rand -base64 64)
JWT_SECRET="votre_secret_jwt_ici"
JWT_REFRESH_SECRET="votre_autre_secret_jwt_ici"

# Signal Engine (générez avec: openssl rand -hex 32)
ENGINE_API_KEY="votre_cle_api_engine"

# Stripe (si vous avez un compte)
STRIPE_SECRET_KEY="sk_test_ou_live_votre_cle"
STRIPE_WEBHOOK_SECRET="whsec_votre_secret"

# URLs (ajustez selon votre déploiement)
FRONTEND_URL=http://62.169.24.224:3000
API_URL=http://62.169.24.224:3001/api
NEXT_PUBLIC_API_URL=http://62.169.24.224:3001/api
NEXT_PUBLIC_WS_URL=ws://62.169.24.224:3001
```

💡 **Générez des secrets sécurisés :**
```bash
bash generate-secrets.sh
```

---

### ÉTAPE 3 : Exécuter le Script de Réparation ⏱️ 10-15 min

```bash
# Sur votre serveur de production
chmod +x repair.sh
./repair.sh
```

Le script va automatiquement :
- ✅ Arrêter les services
- ✅ Nettoyer les caches
- ✅ Rebuild les images Docker
- ✅ Exécuter les migrations Prisma
- ✅ Redémarrer tous les services
- ✅ Tester la santé des services

---

### ÉTAPE 4 : Vérifier le Fonctionnement ⏱️ 5 min

**Tests rapides :**

```bash
# Backend
curl http://localhost:3001/api/health
# Devrait retourner: {"status":"healthy",...}

# Signal Engine
curl http://localhost:8000/health
# Devrait retourner: {"status":"ok"}

# Frontend (dans un navigateur)
http://62.169.24.224:3000
```

**Vérifier les logs :**

```bash
# Tous les services
docker-compose -f docker-compose.prod.yml logs -f

# Seulement le backend
docker-compose -f docker-compose.prod.yml logs -f backend

# Seulement le frontend
docker-compose -f docker-compose.prod.yml logs -f frontend
```

**Ce que vous devez voir :**
- ✅ `✅ Database connected` (backend)
- ✅ `✅ Redis connected` (backend)
- ✅ Pas d'erreur `FATAL: Tenant or user not found`
- ✅ Pas d'erreur `Failed to find Server Action`

---

## 🔍 Dépannage Rapide

### Problème : "Tenant or user not found" persiste

**Solution :**
```bash
# Vérifier votre DATABASE_URL
echo $DATABASE_URL

# Tester la connexion manuellement
docker-compose -f docker-compose.prod.yml run --rm backend \
  npx prisma db pull
```

Si erreur → Vos credentials Supabase sont incorrectes

---

### Problème : "Failed to find Server Action"

**Solution :**
```bash
# Nettoyer complètement le cache Next.js
docker-compose -f docker-compose.prod.yml down
docker volume rm $(docker volume ls -q | grep signals)
docker-compose -f docker-compose.prod.yml build --no-cache frontend
docker-compose -f docker-compose.prod.yml up -d
```

---

### Problème : Le backend ne démarre pas

**Solution :**
```bash
# Vérifier les logs détaillés
docker-compose -f docker-compose.prod.yml logs backend | tail -100

# Vérifier les variables d'environnement
docker-compose -f docker-compose.prod.yml exec backend env | grep DATABASE
```

---

## 📞 Besoin d'aide ?

Si les problèmes persistent :

1. **Exportez les logs complets :**
   ```bash
   docker-compose -f docker-compose.prod.yml logs > logs_full.txt
   ```

2. **Vérifiez votre configuration Supabase :**
   - Connectez-vous au dashboard
   - Vérifiez que le projet est actif
   - Vérifiez les limites (connexions, quotas)

3. **Testez la connectivité :**
   ```bash
   telnet aws-0-eu-west-1.pooler.supabase.com 6543
   ```

---

## 🔐 Sécurité Post-Réparation

**À FAIRE IMMÉDIATEMENT :**

1. ❌ **Supprimer .env.production du Git** (contient vos anciens credentials exposés)
   ```bash
   git rm --cached .env.production
   echo ".env.production" >> .gitignore
   git commit -m "security: remove exposed credentials"
   git push
   ```

2. 🔄 **Changer TOUS les mots de passe exposés**
   - Supabase Database Password ✓ (fait à l'étape 1)
   - Supabase API Keys
   - JWT Secrets
   - Stripe Keys (si exposées)

3. 🔒 **Activer l'authentification à deux facteurs (2FA)**
   - Sur votre compte Supabase
   - Sur votre compte Stripe
   - Sur votre VPS

---

## ✅ Checklist Finale

Avant de considérer la réparation terminée :

- [ ] Nouveau mot de passe Supabase généré
- [ ] Fichier .env créé avec les nouvelles credentials
- [ ] Script repair.sh exécuté avec succès
- [ ] Backend accessible (curl http://localhost:3001/api/health)
- [ ] Frontend accessible (navigateur)
- [ ] Signal Engine fonctionnel
- [ ] Logs sans erreurs critiques
- [ ] .env.production supprimé du Git
- [ ] .gitignore mis à jour
- [ ] Tests de création utilisateur OK
- [ ] Tests d'authentification OK

---

## 📚 Documentation Complète

Pour plus de détails, consultez :
- **REPAIR_PLAN.md** : Plan complet avec explications
- **README.md** : Documentation générale du projet
- **docs/** : Documentation technique

---

## 🎯 Résumé Ultra-Rapide (TL;DR)

```bash
# 1. Réinitialiser Supabase password (dashboard)
# 2. Créer .env avec nouvelles credentials
cp .env.example .env
nano .env  # Remplir avec vraies valeurs

# 3. Exécuter réparation
chmod +x repair.sh
./repair.sh

# 4. Vérifier
curl http://localhost:3001/api/health
```

**Temps total : 15-30 minutes**

Bonne chance ! 🚀
