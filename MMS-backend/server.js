const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const winston = require('winston');
const logger = require('./utils/logger');
const apiLogger = require('./middleware/apiLogger');
require('dotenv').config();

// Import routes
const authRouter = require('./routes/auth');
const userRouter = require('./routes/user');
const assetRouter = require('./routes/asset');
const transferRouter = require('./routes/transfer');
const purchaseRouter = require('./routes/purchase');
const assignmentRouter = require('./routes/assignment');
const expenditureRouter = require('./routes/expenditure');
const dashboardRouter = require('./routes/dashboard');
const activityLogRouter = require('./routes/activityLog');

// Initialize express app
const app = express();
const port = process.env.PORT || 3000;

// Log unhandled exceptions and rejections
process.on('uncaughtException', (error) => {
  logger.error({
    message: 'Uncaught Exception',
    error: error.message,
    stack: error.stack
  });
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  logger.error({
    message: 'Unhandled Promise Rejection',
    error: error.message,
    stack: error.stack
  });
});

// Connect to MongoDB
logger.info('Connecting to MongoDB...');
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  logger.info('Connected to MongoDB successfully');
  console.log('Connected to MongoDB');
})
.catch(err => {
  logger.error({
    message: 'MongoDB connection error',
    error: err.message,
    stack: err.stack
  });
  console.error('MongoDB connection error:', err);
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use(morgan('combined', { stream: logger.stream }));

// Log all API requests and responses
app.use('/api', apiLogger);

// API routes
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/assets', assetRouter);
app.use('/api/transfers', transferRouter);
app.use('/api/purchases', purchaseRouter);
app.use('/api/assignments', assignmentRouter);
app.use('/api/expenditures', expenditureRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/activity-logs', activityLogRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  // Log the error
  logger.error({
    message: 'Express Error Handler',
    error: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userId: req.user ? req.user._id : 'unauthenticated',
    username: req.user ? req.user.username : 'unauthenticated'
  });
  
  // Send error response
  res.status(500).send({
    error: 'Server Error',
    message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message
  });
});

// Start server
app.listen(port, () => {
  logger.info(`Server is running on port ${port} in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`Server is running on port ${port} in ${process.env.NODE_ENV || 'development'} mode`);
});
