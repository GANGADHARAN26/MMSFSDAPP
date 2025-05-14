const express = require('express');
const Transfer = require('../models/Transfer');
const Asset = require('../models/Asset');
const auth = require('../middleware/auth');
const baseAccess = require('../middleware/baseAccess');
const logger = require('../middleware/logger');
const router = new express.Router();

/**
 * @route   GET /api/transfers
 * @desc    Get all transfers with optional filters
 * @access  Private
 */
router.get('/', auth(['Admin', 'BaseCommander', 'LogisticsOfficer']), baseAccess, async (req, res) => {
  try {
    const { fromBase, toBase, status, startDate, endDate, sortBy, sortOrder, limit = 10, skip = 0 } = req.query;
    const match = {};
    const sort = {};
    
    // Apply filters if provided
    if (fromBase) match.fromBase = fromBase;
    if (toBase) match.toBase = toBase;
    if (status) match.status = status;
    
    // Apply date range filter if provided
    if (startDate || endDate) {
      match.createdAt = {};
      if (startDate) match.createdAt.$gte = new Date(startDate);
      if (endDate) match.createdAt.$lte = new Date(endDate);
    }
    
    // Apply base restriction for BaseCommander
    if (req.user.role === 'BaseCommander') {
      // BaseCommander can see transfers to or from their base
      match.$or = [
        { fromBase: req.user.assignedBase },
        { toBase: req.user.assignedBase }
      ];
    }
    
    // Apply sorting if provided
    if (sortBy) {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sort.createdAt = -1; // Default sort by creation date, newest first
    }
    
    const transfers = await Transfer.find(match)
      .sort(sort)
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .populate('transferredBy', 'username fullName')
      .populate('approvedBy', 'username fullName');
    
    const total = await Transfer.countDocuments(match);
    
    res.send({
      transfers,
      total,
      limit: parseInt(limit),
      skip: parseInt(skip),
      hasMore: total > parseInt(skip) + transfers.length
    });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

/**
 * @route   POST /api/transfers
 * @desc    Create a new transfer
 * @access  Private (Admin and LogisticsOfficer)
 */
router.post('/', auth(['Admin', 'LogisticsOfficer']), baseAccess, logger, async (req, res) => {
  try {
    // Check if asset exists and has enough quantity
    const asset = await Asset.findById(req.body.asset);
    
    if (!asset) {
      return res.status(404).send({ error: 'Asset not found' });
    }
    
    // Check if the asset is from the specified base
    if (asset.base !== req.body.fromBase) {
      return res.status(400).send({ error: 'Asset does not belong to the specified source base' });
    }
    
    // Check if there's enough available quantity
    if (asset.available < req.body.quantity) {
      return res.status(400).send({ 
        error: 'Insufficient quantity available',
        available: asset.available,
        requested: req.body.quantity
      });
    }
    
    // Create transfer record
    const transfer = new Transfer({
      ...req.body,
      assetName: asset.name,
      assetType: asset.type,
      transferredBy: req.user._id,
      status: 'Pending'
    });
    
    await transfer.save();
    
    // Update asset balances for the source base
    asset.transferOut += req.body.quantity;
    await asset.updateBalances();
    
    // Check if the asset exists in the destination base
    let destinationAsset = await Asset.findOne({ 
      name: asset.name,
      type: asset.type,
      base: req.body.toBase
    });
    
    // If not, create a new asset record for the destination base
    if (!destinationAsset) {
      destinationAsset = new Asset({
        name: asset.name,
        type: asset.type,
        base: req.body.toBase,
        openingBalance: 0,
        closingBalance: 0,
        purchases: 0,
        transferIn: 0,
        transferOut: 0,
        assigned: 0,
        expended: 0,
        available: 0
      });
    }
    
    // Update destination asset balances
    destinationAsset.transferIn += req.body.quantity;
    await destinationAsset.updateBalances();
    
    res.status(201).send(transfer);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

/**
 * @route   GET /api/transfers/:id
 * @desc    Get transfer by ID
 * @access  Private
 */
router.get('/:id', auth(['Admin', 'BaseCommander', 'LogisticsOfficer']), baseAccess, async (req, res) => {
  try {
    const transfer = await Transfer.findById(req.params.id)
      .populate('transferredBy', 'username fullName')
      .populate('approvedBy', 'username fullName');
    
    if (!transfer) {
      return res.status(404).send({ error: 'Transfer not found' });
    }
    
    // Check if BaseCommander has access to this transfer
    if (req.user.role === 'BaseCommander' && 
        req.user.assignedBase !== transfer.fromBase && 
        req.user.assignedBase !== transfer.toBase) {
      return res.status(403).send({ error: 'Not authorized to access this transfer' });
    }
    
    res.send(transfer);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

/**
 * @route   PUT /api/transfers/:id/approve
 * @desc    Approve a transfer
 * @access  Private (Admin and BaseCommander)
 */
router.put('/:id/approve', auth(['Admin', 'BaseCommander']), baseAccess, logger, async (req, res) => {
  try {
    const transfer = await Transfer.findById(req.params.id);
    
    if (!transfer) {
      return res.status(404).send({ error: 'Transfer not found' });
    }
    
    // Check if BaseCommander has access to approve this transfer
    if (req.user.role === 'BaseCommander' && req.user.assignedBase !== transfer.toBase) {
      return res.status(403).send({ error: 'Not authorized to approve this transfer' });
    }
    
    // Check if transfer is already completed or cancelled
    if (transfer.status !== 'Pending') {
      return res.status(400).send({ error: `Transfer is already ${transfer.status}` });
    }
    
    // Update transfer status
    transfer.status = 'Completed';
    transfer.approvedBy = req.user._id;
    await transfer.save();
    
    res.send(transfer);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

/**
 * @route   PUT /api/transfers/:id/cancel
 * @desc    Cancel a transfer
 * @access  Private (Admin and LogisticsOfficer)
 */
router.put('/:id/cancel', auth(['Admin', 'LogisticsOfficer']), baseAccess, logger, async (req, res) => {
  try {
    const transfer = await Transfer.findById(req.params.id);
    
    if (!transfer) {
      return res.status(404).send({ error: 'Transfer not found' });
    }
    
    // Check if transfer is already completed or cancelled
    if (transfer.status !== 'Pending') {
      return res.status(400).send({ error: `Transfer is already ${transfer.status}` });
    }
    
    // Update transfer status
    transfer.status = 'Cancelled';
    await transfer.save();
    
    // Revert the asset balances for source base
    const sourceAsset = await Asset.findOne({ 
      name: transfer.assetName,
      type: transfer.assetType,
      base: transfer.fromBase
    });
    
    if (sourceAsset) {
      sourceAsset.transferOut -= transfer.quantity;
      await sourceAsset.updateBalances();
    }
    
    // Revert the asset balances for destination base
    const destinationAsset = await Asset.findOne({ 
      name: transfer.assetName,
      type: transfer.assetType,
      base: transfer.toBase
    });
    
    if (destinationAsset) {
      destinationAsset.transferIn -= transfer.quantity;
      await destinationAsset.updateBalances();
    }
    
    res.send(transfer);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

module.exports = router;
