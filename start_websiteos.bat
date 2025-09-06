@echo off
echo ========================================
echo   Starting WebsiteOS Backend + Frontend
echo ========================================

:: Start backend (Uvicorn) in a new CMD window
start "WebsiteOS Backend" cmd /k "cd /d C:\Users\Nick\Downloads\WEBSITEOS && call venv\Scripts\activate && python -m uvicorn api:app --reload"

:: Start frontend (Vite React) in a new CMD window
start "WebsiteOS Frontend" cmd /k "cd /d C:\Users\Nick\Downloads\WEBSITEOS && npm install && npm run dev"

:: Give servers a few seconds to boot
timeout /t 5 >nul

:: Open Swagger UI in browser
start http://127.0.0.1:8000/docs

:: Open Frontend UI in browser
start http://localhost:5173

echo Both backend and frontend are starting...
pause
