require('dotenv').config({ path: `${__dirname}/../.env` });

// Ensure required environment variables are set for tests
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-for-jwt-testing';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test-refresh-secret-key';
process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_PORT = process.env.DB_PORT || 5432;
process.env.DB_NAME = process.env.DB_NAME || 'friasoft_dev';
process.env.DB_USER = process.env.DB_USER || 'friasoft_user';
process.env.DB_PASSWORD = process.env.DB_PASSWORD || 'postgres';
process.env.NODE_ENV = 'test';
