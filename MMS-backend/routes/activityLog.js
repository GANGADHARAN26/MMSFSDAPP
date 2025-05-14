const express = require('express');
const ActivityLog = require('../models/ActivityLog');
const auth = require('../middleware/auth');
const router = new express.Router();

/**
 * @route   GET /api/activity-logs
 * @desc    Get all activity logs with pagination and filters
 * @access  Private (Admin only)
 */
router.get('/', auth(['Admin']), async (req, res) => {
  try {
    const { 
      username, 
      action, 
      resourceType, 
      resourceId,
      startDate,
      endDate,
      sortBy = 'timestamp', 
      sortOrder = 'desc', 
      limit = 20, 
      skip = 0 
    } = req.query;
    
    const match = {};
    const sort = {};
    
    // Apply filters if provided
    if (username) match.username = { $regex: username, $options: 'i' };
    if (action) match.action = action;
    if (resourceType) match.resourceType = resourceType;
    if (resourceId) match.resourceId = resourceId;
    
    // Date range filter
    if (startDate || endDate) {
      match.timestamp = {};
      if (startDate) match.timestamp.$gte = new Date(startDate);
      if (endDate) match.timestamp.$lte = new Date(endDate);
    }
    
    // Apply sorting
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    // Execute query with pagination
    const logs = await ActivityLog.find(match)
      .sort(sort)
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .populate('user', 'username fullName role');
    
    // Get total count for pagination
    const total = await ActivityLog.countDocuments(match);
    
    res.send({
      logs,
      total,
      limit: parseInt(limit),
      skip: parseInt(skip),
      hasMore: total > parseInt(skip) + logs.length
    });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

/**
 * @route   GET /api/activity-logs/:id
 * @desc    Get activity log by ID
 * @access  Private (Admin only)
 */
router.get('/:id', auth(['Admin']), async (req, res) => {
  try {
    const log = await ActivityLog.findById(req.params.id)
      .populate('user', 'username fullName role');
    
    if (!log) {
      return res.status(404).send({ error: 'Activity log not found' });
    }
    
    res.send(log);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

/**
 * @route   GET /api/activity-logs/user/:userId
 * @desc    Get activity logs for a specific user
 * @access  Private (Admin only)
 */
router.get('/user/:userId', auth(['Admin']), async (req, res) => {
  try {
    const { 
      sortBy = 'timestamp', 
      sortOrder = 'desc', 
      limit = 20, 
      skip = 0 
    } = req.query;
    
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    const logs = await ActivityLog.find({ user: req.params.userId })
      .sort(sort)
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .populate('user', 'username fullName role');
    
    const total = await ActivityLog.countDocuments({ user: req.params.userId });
    
    res.send({
      logs,
      total,
      limit: parseInt(limit),
      skip: parseInt(skip),
      hasMore: total > parseInt(skip) + logs.length
    });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

/**
 * @route   GET /api/activity-logs/resource/:resourceType/:resourceId
 * @desc    Get activity logs for a specific resource
 * @access  Private (Admin only)
 */
router.get('/resource/:resourceType/:resourceId', auth(['Admin']), async (req, res) => {
  try {
    const { resourceType, resourceId } = req.params;
    const { 
      sortBy = 'timestamp', 
      sortOrder = 'desc', 
      limit = 20, 
      skip = 0 
    } = req.query;
    
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    const logs = await ActivityLog.find({ 
      resourceType, 
      resourceId 
    })
      .sort(sort)
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .populate('user', 'username fullName role');
    
    const total = await ActivityLog.countDocuments({ 
      resourceType, 
      resourceId 
    });
    
    res.send({
      logs,
      total,
      limit: parseInt(limit),
      skip: parseInt(skip),
      hasMore: total > parseInt(skip) + logs.length
    });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

/**
 * @route   GET /api/activity-logs/actions/:action
 * @desc    Get activity logs for a specific action type
 * @access  Private (Admin only)
 */
router.get('/actions/:action', auth(['Admin']), async (req, res) => {
  try {
    const { 
      sortBy = 'timestamp', 
      sortOrder = 'desc', 
      limit = 20, 
      skip = 0 
    } = req.query;
    
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    const logs = await ActivityLog.find({ action: req.params.action })
      .sort(sort)
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .populate('user', 'username fullName role');
    
    const total = await ActivityLog.countDocuments({ action: req.params.action });
    
    res.send({
      logs,
      total,
      limit: parseInt(limit),
      skip: parseInt(skip),
      hasMore: total > parseInt(skip) + logs.length
    });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

/**
 * @route   GET /api/activity-logs/summary/actions
 * @desc    Get summary of actions (count by action type)
 * @access  Private (Admin only)
 */
router.get('/summary/actions', auth(['Admin']), async (req, res) => {
  try {
    const summary = await ActivityLog.aggregate([
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    res.send(summary);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

/**
 * @route   GET /api/activity-logs/summary/resources
 * @desc    Get summary of resources (count by resource type)
 * @access  Private (Admin only)
 */
router.get('/summary/resources', auth(['Admin']), async (req, res) => {
  try {
    const summary = await ActivityLog.aggregate([
      {
        $group: {
          _id: '$resourceType',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    res.send(summary);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

/**
 * @route   GET /api/activity-logs/summary/users
 * @desc    Get summary of user activity (count by username)
 * @access  Private (Admin only)
 */
router.get('/summary/users', auth(['Admin']), async (req, res) => {
  try {
    const summary = await ActivityLog.aggregate([
      {
        $group: {
          _id: '$username',
          count: { $sum: 1 },
          lastActivity: { $max: '$timestamp' }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 20
      }
    ]);
    
    res.send(summary);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

/**
 * @route   GET /api/activity-logs/summary/daily
 * @desc    Get daily activity summary for the last 30 days
 * @access  Private (Admin only)
 */
router.get('/summary/daily', auth(['Admin']), async (req, res) => {
  try {
    // Calculate date 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const summary = await ActivityLog.aggregate([
      {
        $match: {
          timestamp: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$timestamp' },
            month: { $month: '$timestamp' },
            day: { $dayOfMonth: '$timestamp' }
          },
          count: { $sum: 1 },
          date: { $first: '$timestamp' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);
    
    // Format the response for easier consumption by charts
    const formattedSummary = summary.map(item => ({
      date: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}-${item._id.day.toString().padStart(2, '0')}`,
      count: item.count
    }));
    
    res.send(formattedSummary);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

module.exports = router;