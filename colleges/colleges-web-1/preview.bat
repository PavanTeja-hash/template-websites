@echo off
cd /d "%~dp0public"
start "" http://localhost:8005
python -m http.server 8005
