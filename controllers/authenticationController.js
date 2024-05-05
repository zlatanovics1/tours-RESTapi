const AppError = require('../utils/appError');
const catchAsyncError = require('../utils/catchAsyncError');
const User = require('./../models/userModel');
const jwt = require('jsonwebtoken');

const genUserJWT = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signup = catchAsyncError(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  const token = genUserJWT(newUser._id);

  res.status(201).json({
    status: 'success',
    user: newUser,
    token,
  });
});

exports.login = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePasswords(password, user.password))) {
    return next(new AppError('Invalid email or password!', 401));
  }

  const token = genUserJWT(user._id);

  res.status(200).json({
    status: 'success',
    token,
  });
});
