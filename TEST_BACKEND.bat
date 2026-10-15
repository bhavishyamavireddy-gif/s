@echo off
cd /d "%~dp0"
python -c "import urllib.request; print(urllib.request.urlopen('http://127.0.0.1:5000/health', timeout=3).read().decode())"
if errorlevel 1 echo Backend is not reachable. Start START_BACKEND.bat first.
pause
