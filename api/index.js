const express = require('express');
const cors = require('cors');

const app = express();

// CORS Configuration - allow all origins for cross-domain requests
const corsOptions = {
  origin: '*',
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// API Routes - load from compiled backend
try {
  console.log('Loading backend Express app...');
  const { app: backendApp } = require('../backend/dist/index.js');
  
  if (backendApp) {
    console.log('Successfully loaded backend app');
    // Copy all routes from backend app to this app
    app._router.stack.push(...backendApp._router.stack);
  }
} catch (error) {
  console.error('Error loading backend app:', error.message);
}

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'API endpoint not found',
    },
  });
});

module.exports = app;
