@echo off
setlocal
cd /d "d:\signals new\twa"

echo ============================================
echo   BUILD AAB - SIGNALS PRO pour Google Play
echo ============================================
echo.

:: ===== ENVIRONMENT =====
set "JAVA_HOME=C:\bwrap\jdk\jdk-17.0.11+9"
set "ANDROID_HOME=C:\bwrap\android_sdk"
set "ANDROID_SDK_ROOT=C:\bwrap\android_sdk"
set "PATH=%JAVA_HOME%\bin;%ANDROID_HOME%\tools;%ANDROID_HOME%\platform-tools;%PATH%"

echo JAVA_HOME  = %JAVA_HOME%
echo ANDROID_HOME = %ANDROID_HOME%
echo.

:: ===== License check (already accepted via accept_licenses.ps1) =====
echo Verif des licenses...
set "LICENSES_OK="
if exist "%ANDROID_HOME%\licenses\android-sdk-license" set LICENSES_OK=1
if not defined LICENSES_OK (
    echo [!] Licenses non trouvees. Accepte...
    echo y | "%ANDROID_HOME%\tools\bin\sdkmanager.bat" --sdk_root="%ANDROID_HOME%" --licenses >nul 2>&1
)

:: ===== Build avec Bubblewrap =====
echo.
echo Lancement bubblewrap build...
echo.

:: Repondre "n" (no) aux prompts interactifs de bubblewrap
(echo n && echo n && echo n) | bubblewrap build 2>&1

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ============================================
    echo BUILD REUSSI !
    echo ============================================
    echo.
    echo Fichiers generes :
    dir /s /b *.aab 2>nul
    dir /s /b *.apk 2>nul
    echo.
    echo Fichier a uploader sur https://play.google.com/console/ :
    echo   app\build\outputs\bundle\release\app-release.aab
    echo.
) else (
    echo.
    echo ============================================
    echo BUILD ECHOUE (erreur %ERRORLEVEL%)
    echo ============================================
    echo.
    echo Tente de regenerer le projet d'abord...
    bubblewrap update 2>&1
)
pause