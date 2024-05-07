const AppError = require('../utils/appError');
const catchAsyncError = require('../utils/catchAsyncError');
const User = require('./../models/userModel');

const noUser = (next) => next(new AppError('No user found with such ID', 404));
function filterObjData(obj, ...fields) {
  let newObj;
  Object.keys(obj).forEach((field) => {
    if (fields.includes(field)) newObj[field] = obj[field];
  });
  return newObj;
}
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

///// POST / PATCH REQUESTS
//
//
exports.updateUser = catchAsyncError(async (req, res, next) => {
  const data = filterObjData(req.body, 'email', 'name');
  const updatedUser = await User.findByIdAndUpdate(req.user._id, data, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: updatedUser,
  });
});

//
//
//////

///// DELETE REQUESTS
//
//
exports.deleteUser = catchAsyncError(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, {
    active: false,
  });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
//
//
///////
