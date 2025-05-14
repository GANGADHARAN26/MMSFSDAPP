const express = require('express');
const Asset = require('../models/Asset');
const Transfer = require('../models/Transfer');
const Purchase = require('../models/Purchase');
const Assignment = require('../models/Assignment');
const Expenditure = require('../models/Expenditure');
const auth = require('../middleware/auth');
const baseAccess = require('../middleware/baseAccess');
const router = new express.Router();

/**
 * @route   GET /api/dashboard
 * @desc    Get dashboard data with optional filters
 * @access  Private
 */
router.get('/', auth(['Admin', 'BaseCommander', 'LogisticsOfficer']), baseAccess, async (req, res) => {
  try {
    const { base, assetType, startDate, endDate } = req.query;
    const match = {};
    const dateMatch = {};
    
    // Apply filters if provided
    if (base) match.base = base;
    if (assetType) match.type = assetType;
    
    // Apply date range filter if provided
    if (startDate || endDate) {
      dateMatch.createdAt = {};
      if (startDate) dateMatch.createdAt.$gte = new Date(startDate);
      if (endDate) dateMatch.createdAt.$lte = new Date(endDate);
    }
    
    // Apply base restriction for BaseCommander
    if (req.user.role === 'BaseCommander') {
      match.base = req.user.assignedBase;
    }
    
    // Get asset summary
    const assets = await Asset.find(match);
    
    // Calculate summary metrics
    const summary = {
      totalAssets: assets.length,
      totalOpeningBalance: 0,
      totalClosingBalance: 0,
      totalPurchases: 0,
      totalTransferIn: 0,
      totalTransferOut: 0,
      totalAssigned: 0,
      totalExpended: 0,
      totalAvailable: 0
    };
    
    // Group assets by type
    const assetsByType = {};
    
    assets.forEach(asset => {
      // Update summary metrics
      summary.totalOpeningBalance += asset.openingBalance;
      summary.totalClosingBalance += asset.closingBalance;
      summary.totalPurchases += asset.purchases;
      summary.totalTransferIn += asset.transferIn;
      summary.totalTransferOut += asset.transferOut;
      summary.totalAssigned += asset.assigned;
      summary.totalExpended += asset.expended;
      summary.totalAvailable += asset.available;
      
      // Group by type
      if (!assetsByType[asset.type]) {
        assetsByType[asset.type] = {
          type: asset.type,
          count: 0,
          openingBalance: 0,
          closingBalance: 0,
          assigned: 0,
          available: 0
        };
      }
      
      assetsByType[asset.type].count++;
      assetsByType[asset.type].openingBalance += asset.openingBalance;
      assetsByType[asset.type].closingBalance += asset.closingBalance;
      assetsByType[asset.type].assigned += asset.assigned;
      assetsByType[asset.type].available += asset.available;
    });
    
    // Get recent transfers
    const transferMatch = { ...dateMatch };
    if (base) {
      transferMatch.$or = [{ fromBase: base }, { toBase: base }];
    } else if (req.user.role === 'BaseCommander') {
      transferMatch.$or = [
        { fromBase: req.user.assignedBase },
        { toBase: req.user.assignedBase }
      ];
    }
    
    const recentTransfers = await Transfer.find(transferMatch)
      .sort({ createdAt: -1 })
      .limit(5)
      .select('assetName fromBase toBase quantity status createdAt');
    
    // Get recent purchases
    const purchaseMatch = { ...dateMatch };
    if (base) {
      purchaseMatch.base = base;
    } else if (req.user.role === 'BaseCommander') {
      purchaseMatch.base = req.user.assignedBase;
    }
    
    if (assetType) {
      purchaseMatch.assetType = assetType;
    }
    
    const recentPurchases = await Purchase.find(purchaseMatch)
      .sort({ purchaseDate: -1 })
      .limit(5)
      .select('assetName base quantity status purchaseDate');
    
    // Get recent assignments
    const assignmentMatch = { ...dateMatch };
    if (base) {
      assignmentMatch.base = base;
    } else if (req.user.role === 'BaseCommander') {
      assignmentMatch.base = req.user.assignedBase;
    }
    
    if (assetType) {
      assignmentMatch.assetType = assetType;
    }
    
    const recentAssignments = await Assignment.find(assignmentMatch)
      .sort({ startDate: -1 })
      .limit(5)
      .select('assetName base quantity assignedTo status startDate');
    
    // Get recent expenditures
    const expenditureMatch = { ...dateMatch };
    if (base) {
      expenditureMatch.base = base;
    } else if (req.user.role === 'BaseCommander') {
      expenditureMatch.base = req.user.assignedBase;
    }
    
    if (assetType) {
      expenditureMatch.assetType = assetType;
    }
    
    const recentExpenditures = await Expenditure.find(expenditureMatch)
      .sort({ expenditureDate: -1 })
      .limit(5)
      .select('assetName base quantity reason expenditureDate');
    
    res.send({
      summary,
      assetsByType: Object.values(assetsByType),
      recentTransfers,
      recentPurchases,
      recentAssignments,
      recentExpenditures
    });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

/**
 * @route   GET /api/dashboard/asset/:id
 * @desc    Get detailed dashboard data for a specific asset
 * @access  Private
 */
router.get('/asset/:id', auth(['Admin', 'BaseCommander', 'LogisticsOfficer']), baseAccess, async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);
    
    if (!asset) {
      return res.status(404).send({ error: 'Asset not found' });
    }
    
    // Check if BaseCommander has access to this asset
    if (req.user.role === 'BaseCommander' && req.user.assignedBase !== asset.base) {
      return res.status(403).send({ error: 'Not authorized to access this asset' });
    }
    
    // Get transfers for this asset
    const transfers = await Transfer.find({ asset: asset._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('transferredBy', 'username fullName')
      .populate('approvedBy', 'username fullName');
    
    // Get purchases for this asset
    const purchases = await Purchase.find({ asset: asset._id })
      .sort({ purchaseDate: -1 })
      .limit(10)
      .populate('purchasedBy', 'username fullName')
      .populate('approvedBy', 'username fullName');
    
    // Get assignments for this asset
    const assignments = await Assignment.find({ asset: asset._id })
      .sort({ startDate: -1 })
      .limit(10)
      .populate('assignedBy', 'username fullName');
    
    // Get expenditures for this asset
    const expenditures = await Expenditure.find({ asset: asset._id })
      .sort({ expenditureDate: -1 })
      .limit(10)
      .populate('authorizedBy', 'username fullName');
    
    res.send({
      asset,
      transfers,
      purchases,
      assignments,
      expenditures
    });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

/**
 * @route   GET /api/dashboard/base/:base
 * @desc    Get dashboard data for a specific base
 * @access  Private
 */
router.get('/base/:base', auth(['Admin', 'BaseCommander', 'LogisticsOfficer']), baseAccess, async (req, res) => {
  try {
    const base = req.params.base;
    
    // Check if BaseCommander has access to this base
    if (req.user.role === 'BaseCommander' && req.user.assignedBase !== base) {
      return res.status(403).send({ error: 'Not authorized to access this base' });
    }
    
    // Get assets for this base
    const assets = await Asset.find({ base });
    
    // Calculate summary metrics
    const summary = {
      totalAssets: assets.length,
      totalOpeningBalance: 0,
      totalClosingBalance: 0,
      totalPurchases: 0,
      totalTransferIn: 0,
      totalTransferOut: 0,
      totalAssigned: 0,
      totalExpended: 0,
      totalAvailable: 0
    };
    
    // Group assets by type
    const assetsByType = {};
    
    assets.forEach(asset => {
      // Update summary metrics
      summary.totalOpeningBalance += asset.openingBalance;
      summary.totalClosingBalance += asset.closingBalance;
      summary.totalPurchases += asset.purchases;
      summary.totalTransferIn += asset.transferIn;
      summary.totalTransferOut += asset.transferOut;
      summary.totalAssigned += asset.assigned;
      summary.totalExpended += asset.expended;
      summary.totalAvailable += asset.available;
      
      // Group by type
      if (!assetsByType[asset.type]) {
        assetsByType[asset.type] = {
          type: asset.type,
          count: 0,
          openingBalance: 0,
          closingBalance: 0,
          assigned: 0,
          available: 0
        };
      }
      
      assetsByType[asset.type].count++;
      assetsByType[asset.type].openingBalance += asset.openingBalance;
      assetsByType[asset.type].closingBalance += asset.closingBalance;
      assetsByType[asset.type].assigned += asset.assigned;
      assetsByType[asset.type].available += asset.available;
    });
    
    // Get recent transfers for this base
    const recentTransfers = await Transfer.find({
      $or: [{ fromBase: base }, { toBase: base }]
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('assetName fromBase toBase quantity status createdAt');
    
    // Get recent purchases for this base
    const recentPurchases = await Purchase.find({ base })
      .sort({ purchaseDate: -1 })
      .limit(5)
      .select('assetName quantity status purchaseDate');
    
    // Get recent assignments for this base
    const recentAssignments = await Assignment.find({ base })
      .sort({ startDate: -1 })
      .limit(5)
      .select('assetName quantity assignedTo status startDate');
    
    // Get recent expenditures for this base
    const recentExpenditures = await Expenditure.find({ base })
      .sort({ expenditureDate: -1 })
      .limit(5)
      .select('assetName quantity reason expenditureDate');
    
    res.send({
      base,
      summary,
      assetsByType: Object.values(assetsByType),
      recentTransfers,
      recentPurchases,
      recentAssignments,
      recentExpenditures
    });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

module.exports = router;