const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = new express.Router();

/**
 * @route   GET /api/users
 * @desc    Get all users
 * @access  Private (Admin only)
 */
router.get('/', auth(['Admin']), async (req, res) => {
  try {
    const users = await User.find({});
    res.send(users);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private (Admin only)
 */
router.get('/:id', auth(['Admin']), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }
    res.send(user);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

/**
 * @route   PUT /api/users/:id
 * @desc    Update user
 * @access  Private (Admin only)
 */
router.put('/:id', auth(['Admin']), async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['fullName', 'email', 'role', 'assignedBase', 'active'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));
  
  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates' });
  }
  
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }
    
    updates.forEach(update => user[update] = req.body[update]);
    await user.save();
    
    res.send(user);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user
 * @access  Private (Admin only)
 */
router.delete('/:id', auth(['Admin']), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }
    
    // Instead of deleting, set user to inactive
    user.active = false;
    await user.save();
    
    res.send({ message: 'User deactivated successfully' });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

/**
 * @route   GET /api/users/base/:base
 * @desc    Get users by base
 * @access  Private (Admin and BaseCommander)
 */
router.get('/base/:base', auth(['Admin', 'BaseCommander']), async (req, res) => {
  try {
    // For BaseCommander, ensure they can only access their assigned base
    if (req.user.role === 'BaseCommander' && req.user.assignedBase !== req.params.base) {
      return res.status(403).send({ error: 'Not authorized to access users for this base' });
    }
    
    const users = await User.find({ assignedBase: req.params.base });
    res.send(users);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

module.exports = router;