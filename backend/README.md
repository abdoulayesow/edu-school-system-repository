# Friasoft School Management System - Backend API

Backend API for the Friasoft School Management System, built with Node.js, Express, and PostgreSQL.

## Features

- **School Management**: Multi-tenant school system
- **User Management**: Role-based access control (admin, teacher, accountant, secretary, parent)
- **Student Management**: Enrollment, attendance, and tracking
- **Academic Management**: Grades, timetables, subjects
- **Financial Management**: Invoices, payments, financial reports
- **Notification System**: Email, SMS, and in-app notifications
- **Offline Support**: Sync log for offline-first mobile apps
- **Payment Integration**: Orange Money integration ready
- **Secure**: JWT authentication, password hashing, CORS, helmet security

## Tech Stack

- **Runtime**: Node.js >= 18
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Caching**: Redis
- **Authentication**: JWT + bcryptjs
- **Security**: Helmet, CORS, Rate Limiting

## Prerequisites

Before you start, ensure you have installed:

- **Node.js** (v18.0.0 or higher) - [Download](https://nodejs.org/)
- **PostgreSQL** (v12 or higher) - [Download](https://www.postgresql.org/download/)
- **Redis** (optional, for caching) - [Download](https://redis.io/download)

## Installation & Setup

### Step 1: Install Dependencies

```bash
cd backend
npm install
```

### Step 2: Configure Environment Variables

Copy the example environment file and update it with your settings:

```bash
cp .env.example .env
```

Edit `.env` with your database credentials and other settings:

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=friasoft_dev
DB_USER=friasoft_user
DB_PASSWORD=your_password
JWT_SECRET=your_secret_key
```

### Step 3: Setup PostgreSQL Database

#### Option A: Using psql (PostgreSQL Command Line)

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE friasoft_dev;

# Create user
CREATE USER friasoft_user WITH PASSWORD 'your_password';

# Grant privileges
ALTER ROLE friasoft_user CREATEDB;
GRANT ALL PRIVILEGES ON DATABASE friasoft_dev TO friasoft_user;

# Exit
\q
```

#### Option B: Using pgAdmin (GUI)
- Open pgAdmin
- Create new database: `friasoft_dev`
- Create new user: `friasoft_user`
- Assign privileges

### Step 4: Run Database Migrations

Run the migration script to create all tables:

```bash
npm run db:migrate
```

You should see:
```
🔄 Starting database migrations...
✅ Executed: CREATE TABLE schools...
✅ Executed: CREATE TABLE users...
...
✅ All migrations completed successfully!
```

### Step 5: Start the Server

**Development (with auto-reload):**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

You should see:
```
╔════════════════════════════════════════════╗
║     Friasoft School Management API         ║
║              v0.1.0                        ║
╚════════════════════════════════════════════╝

🚀 Server running at: http://localhost:5000
📝 Environment: development
📊 Health check: http://localhost:5000/api/health
🔧 API version: http://localhost:5000/api/version
```

### Step 6: Test the API

Open your browser or use curl:

```bash
# Health check
curl http://localhost:5000/api/health

# API version
curl http://localhost:5000/api/version
```

## Project Structure

```
backend/
├── src/
│   ├── index.js                 # Main server file
│   ├── config/
│   │   └── database.js          # PostgreSQL connection
│   ├── routes/                  # API endpoints
│   │   ├── auth.js
│   │   ├── schools.js
│   │   ├── users.js
│   │   ├── students.js
│   │   ├── grades.js
│   │   └── invoices.js
│   ├── controllers/             # Business logic
│   ├── models/                  # Database queries
│   ├── middleware/              # Auth, validation
│   ├── services/                # Reusable functions
│   ├── utils/                   # Helpers
│   └── database/
│       ├── schema.sql           # Database schema
│       └── migrations/          # Migration scripts
├── tests/                       # Unit & integration tests
├── .env                         # Environment variables (git ignored)
├── .env.example                 # Environment template
├── package.json                 # Dependencies
└── README.md                    # This file
```

## API Endpoints (Coming Soon)

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh JWT token

### Schools
- `POST /api/schools` - Register school
- `GET /api/schools/:id` - Get school details
- `PUT /api/schools/:id` - Update school

### Users
- `POST /api/users` - Create user
- `GET /api/users` - List users
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Deactivate user

### Students
- `POST /api/students` - Add student
- `GET /api/students` - List students
- `GET /api/students/:id` - Get student details
- `POST /api/classes/:classId/students` - Enroll student

### Grades
- `POST /api/grades` - Enter grade
- `GET /api/grades/student/:id` - Get student grades
- `PUT /api/grades/:id` - Update grade

### Invoices
- `POST /api/invoices` - Create invoice
- `GET /api/invoices` - List invoices
- `POST /api/payments` - Record payment

## Available Scripts

```bash
# Start development server with auto-reload
npm run dev

# Start production server
npm start

# Run tests
npm test

# Watch tests
npm test:watch

# Run database migrations
npm run db:migrate

# Seed database with test data
npm run db:seed

# Lint code
npm run lint

# Fix lint errors
npm run lint:fix
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | development, production |
| `PORT` | Server port | 5000 |
| `HOST` | Server host | localhost |
| `DB_HOST` | Database host | localhost |
| `DB_PORT` | Database port | 5432 |
| `DB_NAME` | Database name | friasoft_dev |
| `DB_USER` | Database user | friasoft_user |
| `DB_PASSWORD` | Database password | your_password |
| `JWT_SECRET` | JWT signing key | your_secret_key |
| `REDIS_HOST` | Redis host | localhost |
| `REDIS_PORT` | Redis port | 6379 |

## Database Schema

The database consists of 13 main tables:

1. **schools** - School information
2. **users** - Teachers, admins, accountants, secretaries, parents
3. **students** - Student records
4. **classes** - School classes/grades
5. **class_students** - Many-to-many class enrollment
6. **subjects** - School subjects
7. **grades** - Student grades in subjects
8. **timetable** - Class schedules
9. **invoices** - Student billing
10. **payments** - Payment records
11. **notifications** - User notifications
12. **announcements** - School announcements
13. **sync_log** - Offline sync tracking

See [schema.sql](./src/database/schema.sql) for detailed table definitions.

## Testing

```bash
# Run all tests
npm test

# Run specific test file
npm test -- tests/auth.test.js

# Run with coverage
npm test -- --coverage
```

## Error Handling

All API responses follow this format:

**Success:**
```json
{
  "status": "OK",
  "data": { ... },
  "message": "Operation successful"
}
```

**Error:**
```json
{
  "status": "ERROR",
  "message": "Error description",
  "code": "ERROR_CODE"
}
```

## Security

- Passwords are hashed with bcryptjs
- JWT tokens expire after 7 days
- All endpoints validate input with Joi
- CORS enabled for frontend domains
- Rate limiting on sensitive endpoints
- Helmet.js for HTTP headers security
- SQL injection prevention via parameterized queries

## Troubleshooting

### Connection Error: "Database connection failed"
- Check PostgreSQL is running: `psql -U postgres`
- Verify `.env` database credentials
- Ensure database and user are created

### Port Already in Use
```bash
# Change PORT in .env
PORT=5001
```

### Redis Connection Error (Optional)
- If Redis is not available, caching will be skipped
- Install Redis or use Upstash (free tier)

## Git Workflow

```bash
# Create feature branch
git checkout -b feat/feature-name

# Commit changes
git add .
git commit -m "feat: Add new feature"

# Push to GitHub
git push origin feat/feature-name

# Create Pull Request
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: Add amazing feature'`)
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues, questions, or suggestions, please open an issue on GitHub.

---

**Happy Coding! 🚀**
