// src/app.js - Express App Configuration
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// ===========================================
// MIDDLEWARE
// ===========================================

// CORS Configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static Files (untuk akses file upload)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Request Logger (Development only)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// ===========================================
// ROUTES
// ===========================================

// Health Check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'SIGTA Backend API is running',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      admin: '/api/admin',
      dosen: '/api/dosen',
      mahasiswa: '/api/mahasiswa'
    }
  });
});

// API Routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const beritaRoutes = require('./routes/beritaRoutes');

// Auth Routes
app.use('/api/auth', authRoutes);

// Admin Routes
app.use('/api/admin', adminRoutes);

// Berita Routes
app.use('/api/berita', beritaRoutes);

// ===========================================
// ERROR HANDLING
// ===========================================

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { error: err.stack })
  });
});

module.exports = app;