/**
 * Logging Example
 * 
 * This file demonstrates how to use the Winston logger in route handlers.
 */

const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const auth = require('../middleware/auth');

/**
 * Example route with logging
 */
router.get('/example', auth(['Admin']), async (req, res) => {
  try {
    // Log the request with additional context
    logger.info({
      message: 'Example route accessed',
      userId: req.user._id,
      username: req.user.username,
      role: req.user.role
    });
    
    // Perform some operation
    const result = await someAsyncOperation();
    
    // Log the successful operation
    logger.info({
      message: 'Example operation completed successfully',
      userId: req.user._id,
      username: req.user.username,
      resultCount: result.length
    });
    
    res.send(result);
  } catch (error) {
    // Log the error with details
    logger.error({
      message: 'Error in example route',
      error: error.message,
      stack: error.stack,
      userId: req.user._id,
      username: req.user.username
    });
    
    res.status(500).send({ error: 'An error occurred' });
  }
});

/**
 * Example route with different log levels
 */
router.post('/example', auth(['Admin']), async (req, res) => {
  // Debug log for development
  logger.debug({
    message: 'Processing example request',
    body: req.body
  });
  
  try {
    // Validate input
    if (!req.body.name) {
      // Warning log for invalid input
      logger.warn({
        message: 'Invalid request: missing name',
        userId: req.user._id,
        username: req.user.username,
        body: req.body
      });
      
      return res.status(400).send({ error: 'Name is required' });
    }
    
    // Process the request
    const result = await processExample(req.body);
    
    // Info log for successful operation
    logger.info({
      message: 'Example created successfully',
      userId: req.user._id,
      username: req.user.username,
      exampleId: result._id
    });
    
    res.status(201).send(result);
  } catch (error) {
    // Error log for exceptions
    logger.error({
      message: 'Failed to create example',
      error: error.message,
      stack: error.stack,
      userId: req.user._id,
      username: req.user.username,
      requestBody: req.body
    });
    
    res.status(500).send({ error: 'Failed to create example' });
  }
});

/**
 * Example of logging performance metrics
 */
router.get('/performance-example', auth(['Admin']), async (req, res) => {
  const startTime = Date.now();
  
  try {
    // Perform some operation
    const result = await someExpensiveOperation();
    
    // Calculate execution time
    const executionTime = Date.now() - startTime;
    
    // Log performance metrics
    logger.info({
      message: 'Performance metrics',
      operation: 'someExpensiveOperation',
      executionTime: `${executionTime}ms`,
      resultSize: JSON.stringify(result).length,
      userId: req.user._id,
      username: req.user.username
    });
    
    res.send(result);
  } catch (error) {
    // Log error with performance context
    logger.error({
      message: 'Error in performance example',
      operation: 'someExpensiveOperation',
      executionTime: `${Date.now() - startTime}ms`,
      error: error.message,
      stack: error.stack,
      userId: req.user._id,
      username: req.user.username
    });
    
    res.status(500).send({ error: 'An error occurred' });
  }
});

// Mock functions for the examples
async function someAsyncOperation() {
  return [{ id: 1, name: 'Example 1' }, { id: 2, name: 'Example 2' }];
}

async function processExample(data) {
  return { _id: '123456789', ...data, createdAt: new Date() };
}

async function someExpensiveOperation() {
  // Simulate an expensive operation
  await new Promise(resolve => setTimeout(resolve, 500));
  return { result: 'Complex data', items: Array(100).fill({ data: 'Item data' }) };
}

module.exports = router;