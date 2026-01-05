@echo off
:: Launch Claude Code with claude.ai themed colors
:: Warm orange/cream aesthetic

:: Set console colors (F0 = bright white bg, orange text would be custom)
:: Using FE for cream background with yellow text as closest to claude.ai
color F6

:: Clear screen for clean look
cls

:: Display welcome message
echo.
echo ================================================
echo   Starting Claude Code in current directory
echo ================================================
echo.

:: Launch Claude Code in the current directory
:: The %~dp0 gets the directory where this script is located
cd /d "%~dp0"

:: Check if claude command exists
where claude >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Claude Code is not installed or not in PATH
    echo.
    echo Please install Claude Code first:
    echo https://docs.claude.com/claude-code
    echo.
    pause
    exit /b 1
)

:: Launch Claude Code
echo Starting Claude Code...
echo.
claude

:: Keep window open if claude exits
pause