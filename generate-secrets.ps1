# ============================================================================
# Générateur de secrets sécurisés pour SignalsPro (Windows PowerShell)
# Exécuter : .\generate-secrets.ps1
# ============================================================================

Write-Host "🔐 Génération de secrets sécurisés..." -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# Générer JWT_SECRET (64 bytes en base64)
$JWT_SECRET = [Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Maximum 256 }))

# Générer JWT_REFRESH_SECRET (64 bytes en base64)
$JWT_REFRESH_SECRET = [Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Maximum 256 }))

# Générer REDIS_PASSWORD (32 bytes en base64, sans caractères spéciaux)
$REDIS_PASSWORD = [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 })) -replace '[=/+]',''

# Générer ENGINE_API_KEY (32 bytes en hexadécimal)
$ENGINE_API_KEY = -join ((1..32) | ForEach-Object { '{0:x}' -f (Get-Random -Maximum 16) })

Write-Host "📋 Copiez ces valeurs dans votre fichier .env.production :" -ForegroundColor Yellow
Write-Host ""
Write-Host "# ─── JWT Secrets ───────────────────────────────────" -ForegroundColor Gray
Write-Host "JWT_SECRET=`"$JWT_SECRET`"" -ForegroundColor Green
Write-Host "JWT_REFRESH_SECRET=`"$JWT_REFRESH_SECRET`"" -ForegroundColor Green
Write-Host ""
Write-Host "# ─── Redis Password ────────────────────────────────" -ForegroundColor Gray
Write-Host "REDIS_PASSWORD=`"$REDIS_PASSWORD`"" -ForegroundColor Yellow
Write-Host ""
Write-Host "# ─── Signal Engine API Key ─────────────────────────" -ForegroundColor Gray
Write-Host "ENGINE_API_KEY=`"$ENGINE_API_KEY`"" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  IMPORTANT : Ne partagez JAMAIS ces secrets !" -ForegroundColor Red
Write-Host "⚠️  Conservez-les en sécurité (gestionnaire de mots de passe recommandé)" -ForegroundColor Red
Write-Host ""
Write-Host "✅ Génération terminée !" -ForegroundColor Green

# Optionnel : Copier dans le presse-papier
Write-Host ""
$copy = Read-Host "Voulez-vous copier les secrets dans le presse-papier ? (o/n)"
if ($copy -eq "o" -or $copy -eq "O") {
    $output = @"
JWT_SECRET="$JWT_SECRET"
JWT_REFRESH_SECRET="$JWT_REFRESH_SECRET"
REDIS_PASSWORD="$REDIS_PASSWORD"
ENGINE_API_KEY="$ENGINE_API_KEY"
"@
    Set-Clipboard -Value $output
    Write-Host "✅ Secrets copiés dans le presse-papier !" -ForegroundColor Green
}
