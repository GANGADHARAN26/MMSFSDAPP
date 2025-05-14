const express = require('express');
const Expenditure = require('../models/Expenditure');
const Asset = require('../models/Asset');
const auth = require('../middleware/auth');
const baseAccess = require('../middleware/baseAccess');
const logger = require('../middleware/logger');
const router = new express.Router();

/**
 * @route   GET /api/expenditures
 * @desc    Get all expenditures with optional filters
 * @access  Private
 */
router.get('/', auth(['Admin', 'BaseCommander', 'LogisticsOfficer']), baseAccess, async (req, res) => {
  try {
    const { base, assetType, reason, startDate, endDate, sortBy, sortOrder, limit = 10, skip = 0 } = req.query;
    const match = {};
    const sort = {};
    
    // Apply filters if provided
    if (base) match.base = base;
    if (assetType) match.assetType = assetType;
    if (reason) match.reason = reason;
    
    // Apply date range filter if provided
    if (startDate || endDate) {
      match.expenditureDate = {};
      if (startDate) match.expenditureDate.$gte = new Date(startDate);
      if (endDate) match.expenditureDate.$lte = new Date(endDate);
    }
    
    // Apply base restriction for BaseCommander
    if (req.user.role === 'BaseCommander') {
      match.base = req.user.assignedBase;
    }
    
    // Apply sorting if provided
    if (sortBy) {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sort.expenditureDate = -1; // Default sort by expenditure date, newest first
    }
    
    const expenditures = await Expenditure.find(match)
      .sort(sort)
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .populate('authorizedBy', 'username fullName');
    
    const total = await Expenditure.countDocuments(match);
    
    res.send({
      expenditures,
      total,
      limit: parseInt(limit),
      skip: parseInt(skip),
      hasMore: total > parseInt(skip) + expenditures.length
    });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

/**
 * @route   POST /api/expenditures
 * @desc    Create a new expenditure
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
    
    // Create expenditure record
    const expenditure = new Expenditure({
      ...req.body,
      assetName: asset.name,
      assetType: asset.type,
      authorizedBy: req.user._id
    });
    
    await expenditure.save();
    
    // Update asset expended quantity
    asset.expended += req.body.quantity;
    await asset.updateBalances();
    
    res.status(201).send(expenditure);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

/**
 * @route   GET /api/expenditures/:id
 * @desc    Get expenditure by ID
 * @access  Private
 */
router.get('/:id', auth(['Admin', 'BaseCommander', 'LogisticsOfficer']), baseAccess, async (req, res) => {
  try {
    const expenditure = await Expenditure.findById(req.params.id)
      .populate('authorizedBy', 'username fullName');
    
    if (!expenditure) {
      return res.status(404).send({ error: 'Expenditure not found' });
    }
    
    // Check if BaseCommander has access to this expenditure
    if (req.user.role === 'BaseCommander' && req.user.assignedBase !== expenditure.base) {
      return res.status(403).send({ error: 'Not authorized to access this expenditure' });
    }
    
    res.send(expenditure);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

/**
 * @route   PUT /api/expenditures/:id
 * @desc    Update expenditure notes
 * @access  Private (Admin and BaseCommander)
 */
router.put('/:id', auth(['Admin', 'BaseCommander']), baseAccess, logger, async (req, res) => {
  try {
    const { notes } = req.body;
    
    if (!notes) {
      return res.status(400).send({ error: 'Notes are required' });
    }
    
    const expenditure = await Expenditure.findById(req.params.id);
    
    if (!expenditure) {
      return res.status(404).send({ error: 'Expenditure not found' });
    }
    
    // Check if BaseCommander has access to this expenditure
    if (req.user.role === 'BaseCommander' && req.user.assignedBase !== expenditure.base) {
      return res.status(403).send({ error: 'Not authorized to update this expenditure' });
    }
    
    // Update notes
    expenditure.notes = expenditure.notes 
      ? `${expenditure.notes}\n${new Date().toISOString()}: ${notes}`
      : `${new Date().toISOString()}: ${notes}`;
    
    await expenditure.save();
    
    res.send(expenditure);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

/**
 * @route   DELETE /api/expenditures/:id
 * @desc    Delete expenditure (Admin only)
 * @access  Private (Admin only)
 */
router.delete('/:id', auth(['Admin']), logger, async (req, res) => {
  try {
    const expenditure = await Expenditure.findById(req.params.id);
    
    if (!expenditure) {
      return res.status(404).send({ error: 'Expenditure not found' });
    }
    
    // Revert the asset expended quantity
    const asset = await Asset.findById(expenditure.asset);
    if (asset) {
      asset.expended -= expenditure.quantity;
      await asset.updateBalances();
    }
    
    await Expenditure.findByIdAndDelete(req.params.id);
    
    res.send({ message: 'Expenditure deleted successfully' });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

module.exports = router;