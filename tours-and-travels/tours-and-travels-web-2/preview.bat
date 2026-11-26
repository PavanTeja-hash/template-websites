@echo off
cd /d "%~dp0public"
start "" http://localhost:8004
python -m http.server 8004
