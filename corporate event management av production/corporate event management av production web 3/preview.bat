@echo off
cd /d "%~dp0public"
start "" http://localhost:8022
python -m http.server 8022
