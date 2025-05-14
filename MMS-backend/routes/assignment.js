const express = require('express');
const Assignment = require('../models/Assignment');
const Asset = require('../models/Asset');
const auth = require('../middleware/auth');
const baseAccess = require('../middleware/baseAccess');
const logger = require('../middleware/logger');
const router = new express.Router();

/**
 * @route   GET /api/assignments
 * @desc    Get all assignments with optional filters
 * @access  Private
 */
router.get('/', auth(['Admin', 'BaseCommander', 'LogisticsOfficer']), baseAccess, async (req, res) => {
  try {
    const { base, assetType, status, assignedTo, startDate, endDate, sortBy, sortOrder, limit = 10, skip = 0 } = req.query;
    const match = {};
    const sort = {};
    
    // Apply filters if provided
    if (base) match.base = base;
    if (assetType) match.assetType = assetType;
    if (status) match.status = status;
    if (assignedTo) match['assignedTo.name'] = { $regex: assignedTo, $options: 'i' };
    
    // Apply date range filter if provided
    if (startDate || endDate) {
      match.startDate = {};
      if (startDate) match.startDate.$gte = new Date(startDate);
      if (endDate) match.startDate.$lte = new Date(endDate);
    }
    
    // Apply base restriction for BaseCommander
    if (req.user.role === 'BaseCommander') {
      match.base = req.user.assignedBase;
    }
    
    // Apply sorting if provided
    if (sortBy) {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sort.startDate = -1; // Default sort by start date, newest first
    }
    
    const assignments = await Assignment.find(match)
      .sort(sort)
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .populate('assignedBy', 'username fullName');
    
    const total = await Assignment.countDocuments(match);
    
    res.send({
      assignments,
      total,
      limit: parseInt(limit),
      skip: parseInt(skip),
      hasMore: total > parseInt(skip) + assignments.length
    });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

/**
 * @route   POST /api/assignments
 * @desc    Create a new assignment
 * @access  Private (Admin and BaseCommander)
 */
router.post('/', auth(['Admin', 'BaseCommander']), baseAccess, logger, async (req, res) => {
  try {
    // Check if asset exists and has enough quantity
    const asset = await Asset.findById(req.body.asset);
    
    if (!asset) {
      return res.status(404).send({ error: 'Asset not found' });
    }
    
    // Check if the asset is from the specified base
    if (asset.base !== req.body.base) {
      return res.status(400).send({ error: 'Asset does not belong to the specified base' });
    }
    
    // Check if there's enough available quantity
    if (asset.available < req.body.quantity) {
      return res.status(400).send({ 
        error: 'Insufficient quantity available',
        available: asset.available,
        requested: req.body.quantity
      });
    }
    
    // Create assignment record
    const assignment = new Assignment({
      ...req.body,
      assetName: asset.name,
      assetType: asset.type,
      assignedBy: req.user._id,
      status: 'Active'
    });
    
    await assignment.save();
    
    // Update asset assigned quantity
    asset.assigned += req.body.quantity;
    await asset.updateBalances();
    
    res.status(201).send(assignment);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

/**
 * @route   GET /api/assignments/:id
 * @desc    Get assignment by ID
 * @access  Private
 */
router.get('/:id', auth(['Admin', 'BaseCommander', 'LogisticsOfficer']), baseAccess, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('assignedBy', 'username fullName');
    
    if (!assignment) {
      return res.status(404).send({ error: 'Assignment not found' });
    }
    
    // Check if BaseCommander has access to this assignment
    if (req.user.role === 'BaseCommander' && req.user.assignedBase !== assignment.base) {
      return res.status(403).send({ error: 'Not authorized to access this assignment' });
    }
    
    res.send(assignment);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

/**
 * @route   PUT /api/assignments/:id/return
 * @desc    Return assigned assets
 * @access  Private (Admin and BaseCommander)
 */
router.put('/:id/return', auth(['Admin', 'BaseCommander']), baseAccess, logger, async (req, res) => {
  try {
    const { returnedQuantity, notes } = req.body;
    
    if (!returnedQuantity || returnedQuantity <= 0) {
      return res.status(400).send({ error: 'Invalid returned quantity' });
    }
    
    const assignment = await Assignment.findById(req.params.id);
    
    if (!assignment) {
      return res.status(404).send({ error: 'Assignment not found' });
    }
    
    // Check if BaseCommander has access to this assignment
    if (req.user.role === 'BaseCommander' && req.user.assignedBase !== assignment.base) {
      return res.status(403).send({ error: 'Not authorized to update this assignment' });
    }
    
    // Check if assignment is already returned or lost/damaged
    if (assignment.status !== 'Active') {
      return res.status(400).send({ error: `Assignment is already ${assignment.status}` });
    }
    
    // Check if returned quantity is valid
    const remainingQuantity = assignment.quantity - assignment.returnedQuantity;
    if (returnedQuantity > remainingQuantity) {
      return res.status(400).send({ 
        error: 'Invalid returned quantity',
        remaining: remainingQuantity,
        requested: returnedQuantity
      });
    }
    
    // Update assignment
    assignment.returnedQuantity += returnedQuantity;
    
    // If all items are returned, mark as returned
    if (assignment.returnedQuantity >= assignment.quantity) {
      assignment.status = 'Returned';
      assignment.endDate = new Date();
    }
    
    if (notes) {
      assignment.notes = assignment.notes 
        ? `${assignment.notes}\n${new Date().toISOString()}: ${notes}`
        : `${new Date().toISOString()}: ${notes}`;
    }
    
    await assignment.save();
    
    // Update asset assigned quantity
    const asset = await Asset.findById(assignment.asset);
    if (asset) {
      asset.assigned -= returnedQuantity;
      await asset.updateBalances();
    }
    
    res.send(assignment);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

/**
 * @route   PUT /api/assignments/:id/status
 * @desc    Update assignment status (lost/damaged)
 * @access  Private (Admin and BaseCommander)
 */
router.put('/:id/status', auth(['Admin', 'BaseCommander']), baseAccess, logger, async (req, res) => {
  try {
    const { status, notes } = req.body;
    
    if (!status || !['Lost', 'Damaged'].includes(status)) {
      return res.status(400).send({ error: 'Invalid status' });
    }
    
    const assignment = await Assignment.findById(req.params.id);
    
    if (!assignment) {
      return res.status(404).send({ error: 'Assignment not found' });
    }
    
    // Check if BaseCommander has access to this assignment
    if (req.user.role === 'BaseCommander' && req.user.assignedBase !== assignment.base) {
      return res.status(403).send({ error: 'Not authorized to update this assignment' });
    }
    
    // Check if assignment is already returned or lost/damaged
    if (assignment.status !== 'Active') {
      return res.status(400).send({ error: `Assignment is already ${assignment.status}` });
    }
    
    // Update assignment
    assignment.status = status;
    assignment.endDate = new Date();
    
    if (notes) {
      assignment.notes = assignment.notes 
        ? `${assignment.notes}\n${new Date().toISOString()}: ${notes}`
        : `${new Date().toISOString()}: ${notes}`;
    }
    
    await assignment.save();
    
    // Update asset assigned quantity and add to expended for lost/damaged items
    const asset = await Asset.findById(assignment.asset);
    if (asset) {
      const remainingQuantity = assignment.quantity - assignment.returnedQuantity;
      asset.assigned -= remainingQuantity;
      asset.expended += remainingQuantity;
      await asset.updateBalances();
    }
    
    res.send(assignment);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

module.exports = router;