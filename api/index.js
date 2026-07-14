/**
 * Vercel Serverless Handler
 * Exports the Express app from the compiled backend
 */

// Set environment variables for serverless execution
process.env.VERCEL = '1';
process.env.NODE_ENV = 'production';

try {
  // Load and export the backend app directly
  const { app } = require('../backend/dist/index.js');
  console.log('[Vercel Handler] Successfully loaded backend app');
  module.exports = app;
} catch (error) {
  console.error('[Vercel Handler] Error loading backend:', error.message);
  console.error('[Vercel Handler] Stack:', error.stack);
  
  // Fallback: create a minimal app that shows the error
  const express = require('express');
  const fallbackApp = express();
  
  fallbackApp.use(express.json());
  fallbackApp.get('/health', (req, res) => {
    res.json({ status: 'error', message: error.message });
  });
  fallbackApp.all('*', (req, res) => {
    res.status(500).json({
      success: false,
      error: {
        code: 'BACKEND_LOAD_ERROR',
        message: 'Failed to load backend app: ' + error.message,
      },
    });
  });
  
  module.exports = fallbackApp;
}
