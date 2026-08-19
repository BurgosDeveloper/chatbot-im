@echo off
title Servidor Catalogo Movil Claymorphism
cls
echo ======================================================================
echo           INICIANDO SERVIDOR DEL CATALOGO MOVIL CLAYMORPHISM
echo ======================================================================
echo.

IF NOT EXIST "node_modules" (
    echo [1/2] Instalando dependencias de Node.js...
    call npm install
    echo.
)

echo [2/2] Obteniendo tu IP local en la red Wi-Fi...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4" /c:"Direcci"') do (
    set IP=%%a
)
set IP=%IP: =%

echo.
echo ======================================================================
echo   SERVIDOR INICIADO CORRECTAMENTE
echo ======================================================================
echo.
echo   * Para abrir en esta computadora (PC):
echo     http://localhost:3000
echo.
echo   * Para abrir en tu Celular (misma red Wi-Fi):
echo     http://%IP%:3000
echo.
echo   * Panel Admin Oculto:
echo     http://localhost:3000/admin/login
echo     (Usuario: admin  ^|  Clave: admin2026!)
echo.
echo ======================================================================
echo Presiona Ctrl + C en cualquier momento para detener el servidor.
echo.

npm run dev
