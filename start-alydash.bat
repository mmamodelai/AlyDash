@echo off
echo ========================================
echo    AlyDash - Hospice Dashboard Clone
echo ========================================
echo.
echo Starting server...
echo.

REM Change to the project directory
cd /d "%~dp0"

REM Check if node_modules exists, if not install dependencies
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    echo.
)

REM Start the server
echo Starting AlyDash server on http://localhost:3000
echo Press Ctrl+C to stop the server
echo.
npm start

REM Keep the window open if there's an error
pause 