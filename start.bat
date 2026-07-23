@echo off
echo ==========================================
echo Starting WorkerSys Backend and Frontend...
echo ==========================================

:: Start backend in a new command window
start "WorkerSys Backend API" cmd /k "cd backend && npm run dev"

:: Start frontend in a new command window
start "WorkerSys Frontend Client" cmd /k "cd frontend && npm run dev"

echo.
echo Both servers are launching in separate windows!
echo ------------------------------------------
echo Backend API Server:  http://127.0.0.1:5000/
echo Frontend Web App:    http://127.0.0.1:5173/
echo ------------------------------------------
echo.
echo You can keep this window open or close it. Do not close the other two windows that opened!
pause
