const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const { errorHandler } = require('./middleware/errorMiddleware');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

const profileRoutes = require('./routes/profileRoutes');
const jobRoutes = require('./routes/jobRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

// Routes
const mountRoutes = (path) => {
  app.use(`${path}/auth`, authRoutes);
  app.use(`${path}/profile`, profileRoutes);
  app.use(`${path}/jobs`, jobRoutes);
  app.use(`${path}/applications`, applicationRoutes);
  app.use(`${path}/analytics`, analyticsRoutes);
};

// Handle both Vercel-prefixed and standard routes
mountRoutes('/api/v1');
mountRoutes('/v1');

// Health Check Route
app.get(['/api/v1/health', '/v1/health'], (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Job Portal API is running' });
});

app.use(errorHandler);

module.exports = app;
