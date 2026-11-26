@echo off
cd /d "%~dp0public"
start "" http://localhost:8003
python -m http.server 8003
