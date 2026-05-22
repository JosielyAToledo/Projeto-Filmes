@echo off
cd /d "%~dp0"

echo Iniciando Projeto-Filmes em http://localhost:3000
echo.
echo Login admin: admin
echo Senha admin: 123456
echo.
echo Para usuario comum, clique em "Criar conta" na tela de login.
echo.

start "Projeto-Filmes Servidor" cmd /k "npm run dev"
timeout /t 3 /nobreak >nul
start "" "http://localhost:3000"
