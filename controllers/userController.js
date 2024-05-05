const AppError = require('../utils/appError');
const catchAsyncError = require('../utils/catchAsyncError');
const User = require('./../models/userModel');

const noUser = (next) => next(new AppError('No user found with such ID', 404));

///// GET REQUESTS
//
//
exports.getUsers = catchAsyncError(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    status: 'success',
    data: users,
  });
});

exports.getUserById = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return noUser(next);

  res.status(200).json({
    status: 'success',
    user,
  });
});
//
//
///////

///// DELETE REQUESTS
//
//
exports.deleteUser = catchAsyncError(async (req, res, next) => {
  const deletedUser = await User.findByIdAndDelete(req.params.id);

  if (!deletedUser) return noUser(next);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
//
//
///////
