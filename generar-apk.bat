@echo off
setlocal
REM ============================================================
REM  Genera el APK de Loteria (release, listo para instalar)
REM  Uso: doble clic en este archivo o ejecutarlo desde la terminal.
REM ============================================================

REM Ir a la carpeta donde esta este .bat (raiz del proyecto)
pushd "%~dp0"

echo.
echo === Verificando herramientas ===
where node >nul 2>nul || (echo [ERROR] No se encontro Node.js. Instalalo desde https://nodejs.org & goto :error)
where java >nul 2>nul || (echo [ERROR] No se encontro Java ^(JDK 17^). Revisa JAVA_HOME. & goto :error)
if "%ANDROID_HOME%"=="" if "%ANDROID_SDK_ROOT%"=="" (
  if exist "%LOCALAPPDATA%\Android\Sdk" (
    set "ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk"
  ) else (
    echo [ERROR] No se encontro el SDK de Android. Define ANDROID_HOME.
    goto :error
  )
)

echo.
echo === 1/4 Generando audios de las cartas (voz de Windows) ===
REM Solo genera los que falten. Para regenerarlos todos borra la carpeta android\app\src\main\res\raw
powershell -NoProfile -ExecutionPolicy Bypass -File "scripts\generar-audios.ps1"
if errorlevel 1 (
  echo [AVISO] No se generaron los audios. La app usara la voz del sistema del equipo.
  echo         En Fire TV probablemente NO se escuchara. Revisa el mensaje de arriba.
  pause
)

echo.
echo === 2/4 Instalando dependencias (npm install) ===
call npm install
if errorlevel 1 goto :error

echo.
echo === 3/4 Compilando APK (puede tardar varios minutos la primera vez) ===
pushd android
REM Solo arquitecturas de telefonos reales para compilar mas rapido
call gradlew.bat assembleRelease -PreactNativeArchitectures=arm64-v8a,armeabi-v7a
set "RESULTADO=%errorlevel%"
popd
if not "%RESULTADO%"=="0" goto :error

echo.
echo === 4/4 Copiando APK ===
set "APK=android\app\build\outputs\apk\release\app-release.apk"
if not exist "%APK%" (echo [ERROR] No se encontro %APK% & goto :error)
copy /Y "%APK%" "Loteria.apk" >nul

echo.
echo ============================================================
echo  LISTO: %CD%\Loteria.apk
echo  Copialo a tu telefono Android e instalalo
echo  ^(permite "instalar apps de origen desconocido"^).
echo ============================================================
popd
pause
exit /b 0

:error
echo.
echo *** Hubo un error. Revisa los mensajes de arriba. ***
popd
pause
exit /b 1
