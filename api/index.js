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

// API Routes - try to load from compiled backend
try {
  const authRoutes = require('../backend/dist/routes/auth.routes.js').default;
  const leadRoutes = require('../backend/dist/routes/lead.routes.js').default;
  const educationLoanRoutes = require('../backend/dist/routes/education-loan.routes.js').default;
  
  app.use('/api/auth', authRoutes);
  app.use('/api/leads', leadRoutes);
  app.use('/api/loans', educationLoanRoutes);
} catch (error) {
  console.error('Failed to load API routes:', error.message);
  // Continue - frontend will still work
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

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
