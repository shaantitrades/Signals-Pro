$sdkRoot = "C:\bwrap\android_sdk"
$licensesDir = "$sdkRoot\licenses"

# Create licenses directory if not exists
if (-not (Test-Path $licensesDir)) {
    New-Item -ItemType Directory -Path $licensesDir -Force | Out-Null
}

# Accept android-sdk-license (hash: 8933bad161af4178b1185d1a37fbf41ea5269c55 or d56f5187479451eabf01fb78af6dfcb131a6481e)
$androidSdkLicense = "`nd56f5187479451eabf01fb78af6dfcb131a6481e`n" 
Set-Content -Path "$licensesDir\android-sdk-license" -Value $androidSdkLicense -NoNewline:$false

# Accept android-sdk-preview-license (hash: 84831b9409646a918e30573bab4c9c91346d8abd)
$previewLicense = "`n84831b9409646a918e30573bab4c9c91346d8abd`n"
Set-Content -Path "$licensesDir\android-sdk-preview-license" -Value $previewLicense -NoNewline:$false

# Accept all other common licenses
$licenses = @(
    @{Name="android-googletv-license"; Hash="601085b94cd77f0b54ff86406957099ebe79c4d6"},
    @{Name="google-gdk-license"; Hash="33b6a2b64607f11b759f320ef9dff4ae5c47d97a"},
    @{Name="intel-android-extra-license"; Hash="d975f751698a77b662f1254ddbe6883900813069"},
    @{Name="mips-android-sysimage-license"; Hash="e9acab5b5fbb560a72cfaecce8946896ff6aab9d"}
)

foreach ($lic in $licenses) {
    $content = "`n$($lic.Hash)`n"
    Set-Content -Path "$licensesDir\$($lic.Name)" -Value $content -NoNewline:$false
}

Write-Host "All 6 SDK licenses accepted."
Write-Host "Licenses directory: $licensesDir"
Get-ChildItem $licensesDir | ForEach-Object { Write-Host "  $_" }