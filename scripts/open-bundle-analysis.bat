@echo off
echo Opening Bundle Analysis Reports...
echo.
echo Opening Client Bundle Analysis...
start "" "%~dp0..\.next\analyze\client.html"
timeout /t 2 /nobreak >nul

echo Opening Node.js Bundle Analysis...
start "" "%~dp0..\.next\analyze\nodejs.html"
timeout /t 2 /nobreak >nul

echo Opening Edge Bundle Analysis...
start "" "%~dp0..\.next\analyze\edge.html"

echo.
echo All bundle analysis reports have been opened in your default browser.
echo.
echo Key insights:
echo - Client bundle: Shows what users download
echo - Node.js bundle: Shows server-side code
echo - Edge bundle: Shows edge runtime code
echo.
pause
