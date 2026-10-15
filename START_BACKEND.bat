@echo off
setlocal
cd /d "%~dp0"
echo ==============================================
echo   SunSense AI - Starting Python backend
echo ==============================================
where python >nul 2>nul
if errorlevel 1 (
  echo Python was not found. Install Python and enable Add Python to PATH.
  pause
  exit /b 1
)
echo Installing required packages (first run may take a few minutes)...
python -m pip install -r requirements.txt
if errorlevel 1 (
  echo Package installation failed. Check internet/Python setup.
  pause
  exit /b 1
)
if not exist "ai_backend\sunsense_model.pkl" (
  echo Training demo model...
  python ai_backend\train_ai.py
  if errorlevel 1 (pause & exit /b 1)
)
echo.
echo Backend health URL: http://127.0.0.1:5000/health
echo Keep this window open while using the website.
echo Press Ctrl+C to stop.
echo.
python ai_backend\app.py
echo.
echo Backend stopped. If an error appeared above, take a screenshot.
pause
