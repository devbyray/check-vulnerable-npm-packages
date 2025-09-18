@echo off
setlocal

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed. Please install Node.js to run this script.
    exit /b 1
)

REM Get the directory where the script is located
set "SCRIPT_DIR=%~dp0"
set "SCRIPT_DIR=%SCRIPT_DIR:~0,-1%"

REM Change to the script directory
cd /d "%SCRIPT_DIR%"

REM Run the check script
if exist "check-compromised.js" (
    node check-compromised.js
) else if exist "check-compromised.cjs" (
    node check-compromised.cjs
) else (
    echo Error: Neither check-compromised.js nor check-compromised.cjs found in %SCRIPT_DIR%
    exit /b 1
)

endlocal