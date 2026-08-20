@echo off
cd /d "d:\signals new\twa"

set "JAVA_HOME=C:\bwrap\jdk\jdk-17.0.11+9"
set "ANDROID_HOME=C:\bwrap\android_sdk"
set "ANDROID_SDK_ROOT=C:\bwrap\android_sdk"
set "PATH=C:\bwrap\jdk\jdk-17.0.11+9\bin;C:\bwrap\android_sdk\tools;C:\bwrap\android_sdk\platform-tools;%PATH%"

echo Building AAB...
call gradlew.bat bundleRelease

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ============================================
    echo BUILD REUSSI !
    echo ============================================
    echo Fichier AAB : app\build\outputs\bundle\release\app-release.aab
    echo.
    echo Uploadez ce fichier sur https://play.google.com/console/
    echo.
) else (
    echo.
    echo ECHEC du build (erreur %ERRORLEVEL%)
    echo.
)

pause