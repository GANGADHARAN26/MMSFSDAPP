const express = require('express');
const Asset = require('../models/Asset');
const auth = require('../middleware/auth');
const baseAccess = require('../middleware/baseAccess');
const logger = require('../middleware/logger');
const router = new express.Router();

/**
 * @route   GET /api/assets
 * @desc    Get all assets with optional filters
 * @access  Private
 */
router.get('/', auth(['Admin', 'BaseCommander', 'LogisticsOfficer']), baseAccess, async (req, res) => {
  try {
    const { base, type, name, sortBy, sortOrder, limit = 10, skip = 0 } = req.query;
    const match = {};
    const sort = {};
    
    // Apply filters if provided
    if (base) match.base = base;
    if (type) match.type = type;
    if (name) match.name = { $regex: name, $options: 'i' };
    
    // Apply base restriction for BaseCommander
    if (req.user.role === 'BaseCommander') {
      match.base = req.user.assignedBase;
    }
    
    // Apply sorting if provided
    if (sortBy) {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sort.createdAt = -1; // Default sort by creation date, newest first
    }
    
    const assets = await Asset.find(match)
      .sort(sort)
      .limit(parseInt(limit))
      .skip(parseInt(skip));
    
    const total = await Asset.countDocuments(match);
    
    res.send({
      assets,
      total,
      limit: parseInt(limit),
      skip: parseInt(skip),
      hasMore: total > parseInt(skip) + assets.length
    });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

/**
 * @route   POST /api/assets
 * @desc    Create a new asset
 * @access  Private (Admin and LogisticsOfficer)
 */
router.post('/', auth(['Admin', 'LogisticsOfficer']), baseAccess, logger, async (req, res) => {
  try {
    const asset = new Asset(req.body);
    
    // Set initial balances
    asset.openingBalance = req.body.openingBalance || 0;
    asset.closingBalance = asset.openingBalance;
    asset.available = asset.openingBalance;
    
    await asset.save();
    res.status(201).send(asset);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

/**
 * @route   GET /api/assets/:id
 * @desc    Get asset by ID
 * @access  Private
 */
router.get('/:id', auth(['Admin', 'BaseCommander', 'LogisticsOfficer']), baseAccess, async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);
    
    if (!asset) {
      return res.status(404).send({ error: 'Asset not found' });
    }
    
    // Check if BaseCommander has access to this asset's base
    if (req.user.role === 'BaseCommander' && req.user.assignedBase !== asset.base) {
      return res.status(403).send({ error: 'Not authorized to access this asset' });
    }
    
    res.send(asset);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

/**
 * @route   PUT /api/assets/:id
 * @desc    Update asset
 * @access  Private (Admin and LogisticsOfficer)
 */
router.put('/:id', auth(['Admin', 'LogisticsOfficer']), baseAccess, logger, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'type', 'base', 'openingBalance'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));
  
  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates' });
  }
  
  try {
    const asset = await Asset.findById(req.params.id);
    
    if (!asset) {
      return res.status(404).send({ error: 'Asset not found' });
    }
    
    // Check if LogisticsOfficer has access to this asset's base
    if (req.user.role === 'LogisticsOfficer' && req.user.assignedBase !== asset.base) {
      return res.status(403).send({ error: 'Not authorized to update this asset' });
    }
    
    // Update asset fields
    updates.forEach(update => asset[update] = req.body[update]);
    
    // If opening balance is updated, recalculate closing balance
    if (updates.includes('openingBalance')) {
      asset.closingBalance = asset.openingBalance + asset.purchases + asset.transferIn - asset.transferOut - asset.expended;
      asset.available = asset.closingBalance - asset.assigned;
    }
    
    await asset.save();
    res.send(asset);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

/**
 * @route   DELETE /api/assets/:id
 * @desc    Delete asset
 * @access  Private (Admin only)
 */
router.delete('/:id', auth(['Admin']), logger, async (req, res) => {
  try {
    const asset = await Asset.findByIdAndDelete(req.params.id);
    
    if (!asset) {
      return res.status(404).send({ error: 'Asset not found' });
    }
    
    res.send({ message: 'Asset deleted successfully' });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

/**
 * @route   GET /api/assets/base/:base
 * @desc    Get assets by base
 * @access  Private
 */
router.get('/base/:base', auth(['Admin', 'BaseCommander', 'LogisticsOfficer']), baseAccess, async (req, res) => {
  try {
    // Check if BaseCommander has access to this base
    if (req.user.role === 'BaseCommander' && req.user.assignedBase !== req.params.base) {
      return res.status(403).send({ error: 'Not authorized to access assets for this base' });
    }
    
    const assets = await Asset.find({ base: req.params.base });
    res.send(assets);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

/**
 * @route   GET /api/assets/type/:type
 * @desc    Get assets by type
 * @access  Private
 */
router.get('/type/:type', auth(['Admin', 'BaseCommander', 'LogisticsOfficer']), baseAccess, async (req, res) => {
  try {
    const match = { type: req.params.type };
    
    // Apply base restriction for BaseCommander
    if (req.user.role === 'BaseCommander') {
      match.base = req.user.assignedBase;
    }
    
    const assets = await Asset.find(match);
    res.send(assets);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

module.exports = router;
