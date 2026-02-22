#!/bin/bash
# ============================================================================
# Générateur de secrets sécurisés pour SignalsPro
# Exécuter : bash generate-secrets.sh
# ============================================================================

echo "🔐 Génération de secrets sécurisés..."
echo "======================================="
echo ""

# Vérifier OpenSSL
if ! command -v openssl &> /dev/null; then
    echo "❌ OpenSSL n'est pas installé"
    exit 1
fi

# Générer les secrets
JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')
JWT_REFRESH_SECRET=$(openssl rand -base64 64 | tr -d '\n')
REDIS_PASSWORD=$(openssl rand -base64 32 | tr -d '\n' | tr -d '=/+')
ENGINE_API_KEY=$(openssl rand -hex 32)

echo "📋 Copiez ces valeurs dans votre fichier .env :"
echo ""
echo "# ─── JWT Secrets ───────────────────────────────────"
echo "JWT_SECRET=\"${JWT_SECRET}\""
echo "JWT_REFRESH_SECRET=\"${JWT_REFRESH_SECRET}\""
echo ""
echo "# ─── Redis Password ────────────────────────────────"
echo "REDIS_PASSWORD=\"${REDIS_PASSWORD}\""
echo ""
echo "# ─── Signal Engine API Key ─────────────────────────"
echo "ENGINE_API_KEY=\"${ENGINE_API_KEY}\""
echo ""
echo "⚠️  IMPORTANT : Ne partagez JAMAIS ces secrets !"
echo "⚠️  Conservez-les en sécurité (gestionnaire de mots de passe recommandé)"
echo ""
echo "✅ Génération terminée !"
