const express = require('express');
const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const User = require('../models/User');

const router = express.Router();

// Authentication middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      throw new Error();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      throw new Error();
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Please authenticate' });
  }
};

// Get all users (except current user)
router.get('/users', auth, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } })
      .select('-password')
      .sort({ username: 1 });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get messages between two users
router.get('/conversation/:userId', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user._id }
      ]
    })
    .sort({ timestamp: 1 })
    .populate('sender', 'username avatar')
    .populate('receiver', 'username avatar');

    // Mark messages as read
    await Message.updateMany(
      { sender: req.params.userId, receiver: req.user._id, read: false },
      { read: true }
    );

    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get unread count
router.get('/unread', auth, async (req, res) => {
  try {
    const unreadCounts = await Message.aggregate([
      { $match: { receiver: req.user._id, read: false } },
      { $group: { _id: '$sender', count: { $sum: 1 } } }
    ]);
    
    const counts = {};
    unreadCounts.forEach(item => {
      counts[item._id] = item.count;
    });
    
    res.json(counts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;