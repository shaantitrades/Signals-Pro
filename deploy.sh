#!/bin/bash
# ============================================================================
# SignalsPro — First-time deployment script for Coolify on Contabo VPS
# Run this on your VPS after installing Coolify
# ============================================================================
set -e

echo "══════════════════════════════════════════════════════"
echo "  SignalsPro — Production Deployment Setup"
echo "══════════════════════════════════════════════════════"

# ── 1. Check prerequisites ──────────────────────────────────
echo ""
echo "▶ Checking prerequisites..."
command -v docker >/dev/null 2>&1 || { echo "❌ Docker not found. Install Coolify first."; exit 1; }
command -v docker compose >/dev/null 2>&1 || { echo "❌ Docker Compose not found."; exit 1; }
echo "✅ Docker & Docker Compose found"

# ── 2. Copy env file ────────────────────────────────────────
if [ ! -f .env ]; then
    echo ""
    echo "▶ Creating .env from .env.production template..."
    cp .env.production .env
    
    # Generate secure secrets
    JWT_SECRET=$(openssl rand -base64 48)
    JWT_REFRESH_SECRET=$(openssl rand -base64 48)
    DB_PASSWORD=$(openssl rand -base64 32 | tr -d '=/+')
    REDIS_PASSWORD=$(openssl rand -base64 32 | tr -d '=/+')
    ENGINE_API_KEY=$(openssl rand -hex 32)
    
    # Replace placeholders
    sed -i "s|CHANGE_ME_STRONG_PASSWORD_MIN_32_CHARS|${DB_PASSWORD}|g" .env
    sed -i "s|CHANGE_ME_STRONG_REDIS_PASSWORD|${REDIS_PASSWORD}|g" .env
    sed -i "s|CHANGE_ME_GENERATE_WITH_OPENSSL_DIFFERENT|${JWT_REFRESH_SECRET}|g" .env
    sed -i "s|CHANGE_ME_GENERATE_WITH_OPENSSL|${JWT_SECRET}|g" .env
    sed -i "s|CHANGE_ME_INTERNAL_ENGINE_KEY|${ENGINE_API_KEY}|g" .env
    
    echo "✅ .env created with generated secrets"
    echo ""
    echo "⚠️  IMPORTANT: Edit .env to set your DOMAIN and Stripe keys:"
    echo "    nano .env"
    echo ""
    echo "   Then re-run this script."
    exit 0
else
    echo "✅ .env file exists"
fi

# ── 3. Check domain is set ──────────────────────────────────
source .env
if [ "$DOMAIN" = "yourdomain.com" ] || [ -z "$DOMAIN" ]; then
    echo "❌ DOMAIN is not set in .env. Edit it first: nano .env"
    exit 1
fi
echo "✅ Domain: $DOMAIN"

# ── 4. Create nginx SSL directory ──────────────────────────
mkdir -p nginx/ssl

# ── 5. Get SSL certificate (first time) ────────────────────
echo ""
echo "▶ Obtaining SSL certificate for $DOMAIN..."

# Start nginx temporarily with HTTP only for certbot challenge
docker compose -f docker-compose.prod.yml up -d nginx
sleep 2

docker compose -f docker-compose.prod.yml run --rm certbot \
    certonly --webroot --webroot-path=/var/www/certbot \
    --email admin@${DOMAIN} --agree-tos --no-eff-email \
    -d ${DOMAIN} -d www.${DOMAIN}

docker compose -f docker-compose.prod.yml down

echo "✅ SSL certificate obtained"

# ── 6. Run database migrations ─────────────────────────────
echo ""
echo "▶ Starting database and running migrations..."
docker compose -f docker-compose.prod.yml up -d postgres redis
sleep 10

docker compose -f docker-compose.prod.yml run --rm backend \
    npx prisma migrate deploy

echo "✅ Database migrations complete"

# ── 7. Build and start all services ────────────────────────
echo ""
echo "▶ Building and starting all services..."
docker compose -f docker-compose.prod.yml up -d --build

echo ""
echo "══════════════════════════════════════════════════════"
echo "  ✅ SignalsPro deployed successfully!"
echo ""
echo "  🌐 https://${DOMAIN}"
echo "  📡 API: https://${DOMAIN}/api/health"
echo ""
echo "  Useful commands:"
echo "    docker compose -f docker-compose.prod.yml logs -f"
echo "    docker compose -f docker-compose.prod.yml ps"
echo "    docker compose -f docker-compose.prod.yml restart"
echo "══════════════════════════════════════════════════════"
