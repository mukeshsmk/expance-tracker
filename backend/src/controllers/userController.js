const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/users
exports.getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().populate('assignedProjects', 'projectName status');
  return ApiResponse.ok(res, 'Users fetched', users);
});

// POST /api/users
exports.createUser = asyncHandler(async (req, res) => {
  const { name, email, phone, role, password, status } = req.body;

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) throw ApiError.conflict('A user with this email already exists');

  const user = await User.create({ name, email, phone, role, password, status });
  return ApiResponse.created(res, 'User created successfully', user.toSafeObject());
});

// PUT /api/users/:id
exports.updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound('User not found');

  const updatable = ['name', 'phone', 'role', 'status'];
  updatable.forEach((field) => {
    if (req.body[field] !== undefined) user[field] = req.body[field];
  });

  // Password reset goes through the same endpoint if a new password is supplied
  if (req.body.password) user.password = req.body.password;

  await user.save();
  return ApiResponse.ok(res, 'User updated successfully', user.toSafeObject());
});

// DELETE /api/users/:id
exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound('User not found');

  await user.deleteOne();
  return ApiResponse.ok(res, 'User deleted successfully', { id: req.params.id });
});
