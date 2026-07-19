const express = require('express');
const Notification = require('../models/Notification');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/', asyncHandler(async (req, res) => {
  const notifications = await Notification.find().sort({ createdAt: -1 }).limit(50);
  return ApiResponse.ok(res, 'Notifications fetched', notifications);
}));

router.put('/:id/read', asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id },
    { isRead: true },
    { new: true }
  );
  return ApiResponse.ok(res, 'Notification marked as read', notification);
}));

module.exports = router;
