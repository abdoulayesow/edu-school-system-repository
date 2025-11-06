@echo off
REM ============================================
REM Friasoft Database Setup Script for Windows
REM ============================================

echo.
echo ╔════════════════════════════════════════════╗
echo ║  Friasoft Database Setup Script           ║
echo ║  PostgreSQL Configuration & Migration     ║
echo ╚════════════════════════════════════════════╝
echo.

REM Check if PostgreSQL is installed
where psql >nul 2>nul
if %errorlevel% neq 0 (
  echo ❌ ERROR: PostgreSQL is not installed or not in PATH
  echo.
  echo Please follow these steps:
  echo 1. Download PostgreSQL from https://www.postgresql.org/download/windows/
  echo 2. Install PostgreSQL (remember the superuser password you set)
  echo 3. Add PostgreSQL bin folder to Windows PATH
  echo    C:\Program Files\PostgreSQL\15\bin
  echo 4. Restart your terminal
  echo 5. Run this script again
  echo.
  pause
  exit /b 1
)

echo ✅ PostgreSQL found:
psql --version
echo.

REM Check .env file
if not exist ".env" (
  echo ❌ ERROR: .env file not found
  echo Please create .env in the backend folder
  echo You can copy from .env.example:
  echo.
  copy ".env.example" ".env"
  echo Created .env from .env.example
  echo Please edit .env with your database password
  echo.
  pause
  exit /b 1
)

echo ✅ Found .env configuration file
echo.

REM Read database configuration from .env
setlocal enabledelayedexpansion
for /f "tokens=* usebackq" %%a in (`findstr "^DB_" .env`) do (
  set "%%a"
)

echo Database Configuration:
echo   Host: !DB_HOST!
echo   Port: !DB_PORT!
echo   Database: !DB_NAME!
echo   User: !DB_USER!
echo.

REM Create database and user
echo Creating database and user...
echo.

REM First, try with postgres superuser
set /p POSTGRES_PASSWORD="Enter PostgreSQL superuser password: "

echo Connecting to PostgreSQL...

REM Create user if not exists
psql -U postgres -h !DB_HOST! -c "CREATE USER !DB_USER! WITH PASSWORD '!DB_PASSWORD!';" 2>nul

REM Create database if not exists
psql -U postgres -h !DB_HOST! -c "CREATE DATABASE !DB_NAME! OWNER !DB_USER!;" 2>nul

REM Grant privileges
psql -U postgres -h !DB_HOST! -c "GRANT ALL PRIVILEGES ON DATABASE !DB_NAME! TO !DB_USER!;" 2>nul

echo.
echo ✅ Database and user configuration complete
echo.

REM Run schema migration
echo Running database migrations...
echo.

psql -U !DB_USER! -d !DB_NAME! -h !DB_HOST! -f src\database\schema.sql

if %errorlevel% equ 0 (
  echo.
  echo ✅ Database schema created successfully!
  echo.
  echo Database is ready. You can now:
  echo   1. Start the backend server: npm run dev
  echo   2. Test the API: curl http://localhost:5000/api/health
  echo.
) else (
  echo.
  echo ❌ ERROR: Failed to create database schema
  echo Please check the error messages above
  echo.
  pause
  exit /b 1
)

REM Verify tables were created
echo.
echo Verifying database tables...
psql -U !DB_USER! -d !DB_NAME! -h !DB_HOST! -c "\dt"

echo.
echo ✅ Setup complete! Database is ready.
echo.
pause
