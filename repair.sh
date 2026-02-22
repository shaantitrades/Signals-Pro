#!/bin/bash
# ============================================================================
# Script de réparation rapide SignalsPro
# Exécuter sur le serveur de production
# ============================================================================
set -e

echo "🔧 SignalsPro - Réparation rapide"
echo "=================================="
echo ""

# ── 1. Vérifier les prérequis ───────────────────────────────
echo "✓ Vérification des prérequis..."
if [ ! -f .env ]; then
    echo "❌ ERREUR: Fichier .env manquant"
    echo "Créez d'abord un fichier .env avec vos credentials Supabase"
    echo "Utilisez .env.example comme modèle"
    exit 1
fi

# ── 2. Charger les variables ────────────────────────────────
source .env

# ── 3. Vérifier DATABASE_URL ────────────────────────────────
if [ -z "$DATABASE_URL" ] || [[ "$DATABASE_URL" == *"YOUR_PASSWORD"* ]] || [[ "$DATABASE_URL" == *"Hababaumri11"* ]]; then
    echo "❌ ERREUR: DATABASE_URL invalide dans .env"
    echo "Mettez à jour votre DATABASE_URL avec les nouvelles credentials Supabase"
    exit 1
fi

echo "✓ Variables d'environnement OK"
echo ""

# ── 4. Arrêter les services ─────────────────────────────────
echo "⏸️  Arrêt des services..."
docker-compose -f docker-compose.prod.yml down

# ── 5. Nettoyer les caches ──────────────────────────────────
echo "🧹 Nettoyage des caches..."
rm -rf frontend/.next
rm -rf frontend/node_modules/.cache
rm -rf backend/dist

# ── 6. Rebuild complet ──────────────────────────────────────
echo "🔨 Reconstruction des images Docker..."
docker-compose -f docker-compose.prod.yml build --no-cache

# ── 7. Démarrer PostgreSQL et Redis ────────────────────────
echo "🚀 Démarrage de la base de données..."
docker-compose -f docker-compose.prod.yml up -d redis
sleep 5

# ── 8. Exécuter les migrations Prisma ──────────────────────
echo "📊 Exécution des migrations..."
docker-compose -f docker-compose.prod.yml run --rm backend \
    sh -c "npx prisma generate && npx prisma migrate deploy"

if [ $? -ne 0 ]; then
    echo "❌ ERREUR: Migrations échouées"
    echo "Vérifiez vos credentials Supabase et la connectivité"
    docker-compose -f docker-compose.prod.yml logs backend
    exit 1
fi

echo "✓ Migrations réussies"
echo ""

# ── 9. Démarrer tous les services ──────────────────────────
echo "🚀 Démarrage de tous les services..."
docker-compose -f docker-compose.prod.yml up -d

echo ""
echo "⏳ Attente du démarrage des services (30s)..."
sleep 30

# ── 10. Tests de santé ──────────────────────────────────────
echo ""
echo "🏥 Tests de santé..."

# Test Backend
if curl -s http://localhost:3001/api/health > /dev/null; then
    echo "✅ Backend: OK"
else
    echo "❌ Backend: ÉCHEC"
    docker-compose -f docker-compose.prod.yml logs --tail=50 backend
fi

# Test Signal Engine
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ Signal Engine: OK"
else
    echo "⚠️  Signal Engine: Démarrage en cours..."
fi

# Test Frontend
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend: OK"
else
    echo "❌ Frontend: ÉCHEC"
    docker-compose -f docker-compose.prod.yml logs --tail=50 frontend
fi

echo ""
echo "=================================="
echo "✅ Réparation terminée !"
echo ""
echo "🌐 Accès:"
echo "   Frontend: http://$(hostname -I | awk '{print $1}'):3000"
echo "   Backend:  http://$(hostname -I | awk '{print $1}'):3001"
echo "   Engine:   http://$(hostname -I | awk '{print $1}'):8000"
echo ""
echo "📋 Vérifier les logs:"
echo "   docker-compose -f docker-compose.prod.yml logs -f"
echo ""
