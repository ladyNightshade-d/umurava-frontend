@echo off
echo ========================================
echo Starting Next.js Development Server
echo ========================================
echo.
echo Current directory: %CD%
echo.
echo Installing dependencies...
call npm install @tailwindcss/postcss --legacy-peer-deps
echo.
echo Starting server...
echo.
call npm run dev
