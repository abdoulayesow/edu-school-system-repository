# PostgreSQL Setup Guide for Friasoft School Management System

## Prerequisites

- Windows 10 or later
- Administrator access to install PostgreSQL

## Step 1: Download and Install PostgreSQL

### Option A: Using PostgreSQL Installer (Recommended)

1. **Download PostgreSQL for Windows**
   - Visit: https://www.postgresql.org/download/windows/
   - Click on "Download the installer"
   - Select version **14.x** or **15.x** (current stable versions)

2. **Run the Installer**
   - Accept default installation directory: `C:\Program Files\PostgreSQL\15`
   - Default port: **5432** (important - matches our config)
   - Password: **postgres** (for superuser, or set your own)
   - Default database locale: OK to accept

3. **Components to Install:**
   - ✅ PostgreSQL Server
   - ✅ pgAdmin 4 (optional but useful for GUI management)
   - ✅ Command Line Tools
   - ❌ Stack Builder (optional)

4. **Verify Installation:**
   ```bash
   psql --version
   ```

### Option B: Using Chocolatey (If Installed)

```bash
choco install postgresql15
```

## Step 2: Configure Environment

After installation, PostgreSQL command-line tools need to be accessible. Add to Windows PATH:

1. Open System Properties → Environment Variables
2. Edit PATH and add: `C:\Program Files\PostgreSQL\15\bin`
3. Restart your terminal/IDE

## Step 3: Create Database and User

Open Command Prompt or PowerShell and run:

```bash
# Connect to PostgreSQL with default superuser
psql -U postgres

# In psql prompt, run:
CREATE USER friasoft_user WITH PASSWORD 'postgres';
CREATE DATABASE friasoft_dev OWNER friasoft_user;
GRANT ALL PRIVILEGES ON DATABASE friasoft_dev TO friasoft_user;
\q
```

## Step 4: Initialize Database Schema

```bash
# Navigate to backend folder
cd backend

# Run migration script
npm run db:migrate
```

Or manually:

```bash
# Connect to the database
psql -U friasoft_user -d friasoft_dev -h localhost -f src/database/schema.sql
```

## Step 5: Verify Setup

```bash
# Check if database was created
psql -U postgres -l

# Connect to friasoft_dev
psql -U friasoft_user -d friasoft_dev -h localhost

# List tables
\dt

# Exit
\q
```

Expected tables: 13 tables
- schools
- users
- students
- classes
- class_students
- subjects
- grades
- timetable
- invoices
- payments
- notifications
- announcements
- sync_log

## Step 6: Start the Backend Server

```bash
cd backend
npm run dev
```

Server should start at: `http://localhost:5000`

## Troubleshooting

### Issue: `psql: command not found`
**Solution**: Add PostgreSQL to PATH and restart terminal
- PATH should include: `C:\Program Files\PostgreSQL\15\bin`

### Issue: `FATAL: Ident authentication failed for user "friasoft_user"`
**Solution**: Edit `C:\Program Files\PostgreSQL\15\data\pg_hba.conf`
- Change `ident` to `md5` or `scram-sha-256`
- Restart PostgreSQL service

### Issue: `FATAL: no pg_hba.conf entry for host`
**Solution**: PostgreSQL service not running
```bash
# Windows: Start PostgreSQL service
net start postgresql-x64-15

# Or use Services management console (services.msc)
```

### Issue: `FATAL: password authentication failed`
**Solution**: Wrong password or user doesn't exist
- Run Step 3 again to create user and database

### Issue: `database "friasoft_dev" already exists`
**Solution**: Drop existing database first
```bash
psql -U postgres
DROP DATABASE IF EXISTS friasoft_dev;
CREATE DATABASE friasoft_dev OWNER friasoft_user;
\q
```

## Verify Everything Works

```bash
# 1. Check database connection
psql -U friasoft_user -d friasoft_dev -c "SELECT version();"

# 2. Start backend
cd backend
npm install  # if not done
npm run dev

# 3. Test API health in another terminal
curl http://localhost:5000/api/health

# Expected response:
# {
#   "status": "OK",
#   "timestamp": "2024-11-06T...",
#   "message": "Friasoft School Management API is running",
#   "version": "0.1.0",
#   "environment": "development"
# }
```

## Connect Using GUI (Optional)

**Using pgAdmin 4** (included with PostgreSQL):
1. Open pgAdmin 4 (desktop application)
2. Right-click "Servers" → Create → Server
3. Name: `Friasoft Dev`
4. Connection tab:
   - Host: `localhost`
   - Port: `5432`
   - User: `friasoft_user`
   - Password: `postgres`
5. Click Save

## Database Connection Details

```
Host: localhost
Port: 5432
Database: friasoft_dev
User: friasoft_user
Password: postgres  (or your chosen password)
```

These should match your `.env` file in the backend folder.

## Next Steps

After database setup:

1. ✅ Database created and schema initialized
2. ✅ Server running and connected to database
3. 🔄 Test all 40+ API endpoints
4. 📝 Load test the system
5. 🚀 Proceed to frontend development

## Resources

- PostgreSQL Documentation: https://www.postgresql.org/docs/
- pgAdmin Documentation: https://www.pgadmin.org/docs/
- Friasoft Backend: `./backend/README.md`
- API Endpoints: `../BACKEND_COMPLETE.md`
