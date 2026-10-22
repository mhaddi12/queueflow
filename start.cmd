@echo off
cd /d "%~dp0"
echo Open http://127.0.0.1:4173 in your browser. Close this window to stop.
node server.mjs
pause
