// server.js - Entry Point Backend SIGTA
require('dotenv').config();
const app = require('./src/app');
const db = require('./src/config/database');

const PORT = process.env.PORT || 5000;

// Test Database Connection
db.getConnection()
  .then(connection => {
    console.log('✅ Database connected successfully!');
    connection.release();
    
    // Start Server
    app.listen(PORT, () => {
      console.log('╔════════════════════════════════════════════╗');
      console.log('║        SIGTA Backend Server Running        ║');
      console.log('╚════════════════════════════════════════════╝');
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV}`);
      console.log(`🌐 API URL: http://localhost:${PORT}/api`);
      console.log(`📖 Health Check: http://localhost:${PORT}/`);
      console.log('');
    });
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err.message);
    console.error('💡 Check your .env database configuration!');
    process.exit(1);
  });