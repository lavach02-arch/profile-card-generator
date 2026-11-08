@echo off
title DevCard Studio - User Profile Card Generator
color 0B
echo ========================================================
echo       DEVCARD STUDIO - PROFILE CARD GENERATOR
echo ========================================================
echo.
cd /d "%~dp0\backend"
echo Starting Node.js backend server on http://localhost:5002 ...
start "" "http://localhost:5002"
node src/server.js
pause
