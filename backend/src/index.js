const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const authRoutes = require('./routes/auth');

const app = express();

// ============================================
// MIDDLEWARE
// ============================================

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'development'
    ? ['http://localhost:3000', 'http://localhost:3001']
    : ['https://yourdomain.com'],
  credentials: true,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Logging middleware
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));

// ============================================
// ROUTES
// ============================================

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      message: 'Friasoft School Management API is running',
      version: process.env.APP_VERSION,
      environment: process.env.NODE_ENV,
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: error.message,
    });
  }
});

// API version endpoint
app.get('/api/version', (req, res) => {
  res.json({
    version: process.env.APP_VERSION,
    name: process.env.APP_NAME,
    environment: process.env.NODE_ENV,
  });
});

// Authentication routes
app.use('/api/auth', authRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'ERROR',
    message: 'Endpoint not found',
    path: req.path,
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('❌ Error:', error);

  const status = error.status || 500;
  const message = error.message || 'Internal Server Error';

  res.status(status).json({
    status: 'ERROR',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
});

// ============================================
// START SERVER
// ============================================

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || 'localhost';

app.listen(PORT, HOST, () => {
  console.log(`
╔════════════════════════════════════════════╗
║     Friasoft School Management API         ║
║              v${process.env.APP_VERSION}                ║
╚════════════════════════════════════════════╝

🚀 Server running at: http://${HOST}:${PORT}
📝 Environment: ${process.env.NODE_ENV}
📊 Health check: http://${HOST}:${PORT}/api/health
🔧 API version: http://${HOST}:${PORT}/api/version

Ready to handle requests...
  `);
});

module.exports = app;
