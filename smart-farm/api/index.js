// Vercel Serverless Function — Smart Farm Management System Backend
// This file wraps the Express app for Vercel's serverless runtime.

require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const path       = require('path');
const connectDB  = require('../backend/config/db');

const app = express();

// Connect to MongoDB (connection is reused across warm invocations)
connectDB();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',      require('../backend/routes/auth'));
app.use('/api/land',      require('../backend/routes/land'));
app.use('/api/equipment', require('../backend/routes/equipment'));
app.use('/api/crops',     require('../backend/routes/crops'));
app.use('/api/admin',     require('../backend/routes/admin'));
app.use('/api/weather',   require('../backend/routes/weather'));
app.use('/api/messages',  require('../backend/routes/messages'));
app.use('/api/listings',  require('../backend/routes/listings'));

// Health check
app.get('/api', (req, res) => {
  res.json({ message: '🌾 Smart Farm API is running', version: '2.0.0' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server Error' });
});

module.exports = app;
