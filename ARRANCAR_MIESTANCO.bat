@echo off
echo ========================================
echo   MiEstanco - Arranque completo
echo ========================================
echo.

echo [1/3] Arrancando Backend (Spring Boot)...
start "MiEstanco - Backend" cmd /k "cd /d C:\Users\leona\Documents\DAM\1DAM\Digital\Workspace\Kit_Digital\miestanco-backend && mvnw.cmd spring-boot:run"

echo Esperando 20 segundos a que arranque el backend...
timeout /t 20 /nobreak > nul

echo [2/3] Arrancando Frontend (Express produccion)...
start "MiEstanco - Frontend" cmd /k "cd /d C:\Users\leona\Documents\DAM\1DAM\Digital\Workspace\Kit_Digital\miestanco-frontend && node server.js"

echo Esperando 3 segundos...
timeout /t 3 /nobreak > nul

echo [3/3] Arrancando ngrok (tunel HTTPS)...
start "MiEstanco - Ngrok" cmd /k "ngrok http 4201"

echo.
echo ========================================
echo  Todo arrancado! Abre ngrok para ver
echo  la URL publica (https://...).
echo  
echo  Usuarios disponibles:
echo    padre / 1234  (Admin)
echo    madre / 1234  (Admin)
echo    admin / 1234  (Admin)
echo    trabajadora1 / 1234
echo    trabajadora2 / 1234
echo ========================================
pause
