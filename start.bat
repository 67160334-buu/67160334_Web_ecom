@echo off
chcp 65001 > nul
title FORME - Jewelry E-Commerce Server
echo ========================================================
echo    💎 FORME HAUTE JOAILLERIE - SERVER STARTING
echo ========================================================
echo.
echo Opening browser: http://127.0.0.1:5000
start http://127.0.0.1:5000
echo Running Flask server...
py app.py
pause
