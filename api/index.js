/**
 * Vercel Serverless Handler
 * Exports the Express app from the compiled backend
 */

// Set environment variables for serverless execution
process.env.VERCEL = '1';
process.env.NODE_ENV = 'production';

try {
  // Load the backend app
  const { app } = require('../backend/dist/index.js');
  console.log('[Vercel Handler] Successfully loaded backend app');
  
  // Handle the request and strip /api prefix if present
  module.exports = (req, res) => {
    // Log incoming request
    console.log(`[Vercel Handler] Incoming: ${req.method} ${req.url}`);
    
    // If the request URL is /api/something, strip /api
    if (req.url && req.url.startsWith('/api')) {
      req.url = req.url.slice(4) || '/';
      req.path = req.path?.slice(4) || '/';
    }
    
    console.log(`[Vercel Handler] Modified URL: ${req.url}`);
    
    // Call the Express app
    return app(req, res);
  };
} catch (error) {
  console.error('[Vercel Handler] Error loading backend:', error.message);
  console.error('[Vercel Handler] Stack:', error.stack);
  
  // Fallback: create a minimal app that shows the error
  const express = require('express');
  const fallbackApp = express();
  
  fallbackApp.use(express.json());
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
