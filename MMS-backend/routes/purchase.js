const express = require('express');
const Purchase = require('../models/Purchase');
const Asset = require('../models/Asset');
const auth = require('../middleware/auth');
const baseAccess = require('../middleware/baseAccess');
const logger = require('../middleware/logger');
const router = new express.Router();

/**
 * @route   GET /api/purchases
 * @desc    Get all purchases with optional filters
 * @access  Private
 */
router.get('/', auth(['Admin', 'BaseCommander', 'LogisticsOfficer']), baseAccess, async (req, res) => {
  try {
    const { base, assetType, status, startDate, endDate, sortBy, sortOrder, limit = 10, skip = 0 } = req.query;
    const match = {};
    const sort = {};
    
    // Apply filters if provided
    if (base) match.base = base;
    if (assetType) match.assetType = assetType;
    if (status) match.status = status;
    
    // Apply date range filter if provided
    if (startDate || endDate) {
      match.purchaseDate = {};
      if (startDate) match.purchaseDate.$gte = new Date(startDate);
      if (endDate) match.purchaseDate.$lte = new Date(endDate);
    }
    
    // Apply base restriction for BaseCommander
    if (req.user.role === 'BaseCommander') {
      match.base = req.user.assignedBase;
    }
    
    // Apply sorting if provided
    if (sortBy) {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sort.purchaseDate = -1; // Default sort by purchase date, newest first
    }
    
    const purchases = await Purchase.find(match)
      .sort(sort)
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .populate('purchasedBy', 'username fullName')
      .populate('approvedBy', 'username fullName');
    
    const total = await Purchase.countDocuments(match);
    
    res.send({
      purchases,
      total,
      limit: parseInt(limit),
      skip: parseInt(skip),
      hasMore: total > parseInt(skip) + purchases.length
    });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

/**
 * @route   POST /api/purchases
 * @desc    Create a new purchase
 * @access  Private (Admin and LogisticsOfficer)
 */
router.post('/', auth(['Admin', 'LogisticsOfficer']), baseAccess, logger, async (req, res) => {
  try {
    // Create purchase record
    const purchase = new Purchase({
      ...req.body,
      purchasedBy: req.user._id,
      status: 'Ordered'
    });
    
    await purchase.save();
    
    // Check if the asset exists in the base
    let asset = await Asset.findOne({ 
      name: req.body.assetName,
      type: req.body.assetType,
      base: req.body.base
    });
    
    // If not, create a new asset record
    if (!asset) {
      asset = new Asset({
        name: req.body.assetName,
        type: req.body.assetType,
        base: req.body.base,
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
    
    // Update asset with purchase information if status is Delivered
    if (req.body.status === 'Delivered') {
      asset.purchases += req.body.quantity;
      await asset.updateBalances();
      
      // Update purchase with asset reference
      purchase.asset = asset._id;
      await purchase.save();
    }
    
    res.status(201).send(purchase);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

/**
 * @route   GET /api/purchases/:id
 * @desc    Get purchase by ID
 * @access  Private
 */
router.get('/:id', auth(['Admin', 'BaseCommander', 'LogisticsOfficer']), baseAccess, async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id)
      .populate('purchasedBy', 'username fullName')
      .populate('approvedBy', 'username fullName');
    
    if (!purchase) {
      return res.status(404).send({ error: 'Purchase not found' });
    }
    
    // Check if BaseCommander has access to this purchase
    if (req.user.role === 'BaseCommander' && req.user.assignedBase !== purchase.base) {
      return res.status(403).send({ error: 'Not authorized to access this purchase' });
    }
    
    res.send(purchase);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

/**
 * @route   PUT /api/purchases/:id/deliver
 * @desc    Mark a purchase as delivered
 * @access  Private (Admin and LogisticsOfficer)
 */
router.put('/:id/deliver', auth(['Admin', 'LogisticsOfficer']), baseAccess, logger, async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id);
    
    if (!purchase) {
      return res.status(404).send({ error: 'Purchase not found' });
    }
    
    // Check if purchase is already delivered or cancelled
    if (purchase.status !== 'Ordered') {
      return res.status(400).send({ error: `Purchase is already ${purchase.status}` });
    }
    
    // Update purchase status
    purchase.status = 'Delivered';
    purchase.deliveryDate = new Date();
    purchase.approvedBy = req.user._id;
    await purchase.save();
    
    // Update asset quantities
    let asset = await Asset.findOne({ 
      name: purchase.assetName,
      type: purchase.assetType,
      base: purchase.base
    });
    
    // If asset doesn't exist, create it
    if (!asset) {
      asset = new Asset({
        name: purchase.assetName,
        type: purchase.assetType,
        base: purchase.base,
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
    
    // Update asset with purchase information
    asset.purchases += purchase.quantity;
    await asset.updateBalances();
    
    // Update purchase with asset reference
    purchase.asset = asset._id;
    await purchase.save();
    
    res.send(purchase);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

/**
 * @route   PUT /api/purchases/:id/cancel
 * @desc    Cancel a purchase
 * @access  Private (Admin and LogisticsOfficer)
 */
router.put('/:id/cancel', auth(['Admin', 'LogisticsOfficer']), baseAccess, logger, async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id);
    
    if (!purchase) {
      return res.status(404).send({ error: 'Purchase not found' });
    }
    
    // Check if purchase is already delivered or cancelled
    if (purchase.status === 'Cancelled') {
      return res.status(400).send({ error: 'Purchase is already cancelled' });
    }
    
    // If purchase was delivered, revert the asset quantities
    if (purchase.status === 'Delivered' && purchase.asset) {
      const asset = await Asset.findById(purchase.asset);
      
      if (asset) {
        asset.purchases -= purchase.quantity;
        await asset.updateBalances();
      }
    }
    
    // Update purchase status
    purchase.status = 'Cancelled';
    await purchase.save();
    
    res.send(purchase);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

module.exports = router;