@echo off
cd /d "%~dp0public"
start "" http://localhost:8023
python -m http.server 8023
