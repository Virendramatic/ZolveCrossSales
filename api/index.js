const path = require('path');
const express = require('express');
const cors = require('cors');

const app = express();

// CORS Configuration
const corsOptions = {
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from Frontend/dist BEFORE API routes
const frontendPath = path.join(__dirname, '../Frontend/dist');
app.use(express.static(frontendPath));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// API Routes - try to load from compiled backend
try {
  console.log('Loading API routes from backend/dist...');
  
  // Try to require the main backend module which exports all routes
  try {
    const backendApp = require('../backend/dist/index.js').app;
    if (backendApp) {
      console.log('Successfully loaded full backend app');
      // Mount the backend app's routes
      app.use(backendApp);
    }
  } catch (e) {
    console.warn('Could not load full backend app, trying individual routes:', e.message);
    
    // Fallback: Try individual routes
    try {
      const authRoutes = require('../backend/dist/routes/auth.routes.js').default;
      const leadRoutes = require('../backend/dist/routes/lead.routes.js').default;
      const educationLoanRoutes = require('../backend/dist/routes/education-loan.routes.js').default;
      
      app.use('/api/auth', authRoutes);
      app.use('/api/leads', leadRoutes);
      app.use('/api/loans', educationLoanRoutes);
      
      console.log('Successfully loaded individual API routes');
    } catch (err) {
      console.warn('Could not load individual routes:', err.message);
    }
  }
  
  // Success message
  app.get('/', (req, res) => {
    res.send(`
      <h1>Zolve CRM API</h1>
      <p>Backend API is running. Use /api/ endpoints to interact with the API.</p>
      <p>Health check: <a href="/health">/health</a></p>
    `);
  });
} catch (error) {
  console.error('Error setting up API routes:', error.message);
}

// 404 handler for API routes
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'API endpoint not found',
    },
  });
});

// SPA fallback - serve index.html for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

module.exports = app;
