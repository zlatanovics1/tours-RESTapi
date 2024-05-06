const jwt = require('jsonwebtoken');
const { promisify } = require('util');

const User = require('./../models/userModel');
const catchAsyncError = require('../utils/catchAsyncError');
const AppError = require('../utils/appError');
const sendMail = require('./../utils/email');
const { hashToken } = require('./../utils/helpers');

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
    passwordChangedAt: req.body.passwordChangedAt,
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

  if (!user || !(await user.validatePassword(password))) {
    return next(new AppError('Invalid email or password!', 400));
  }

  const token = genUserJWT(user._id);

  res.status(200).json({
    status: 'success',
    token,
  });
});

exports.forgotPassword = catchAsyncError(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) next(new AppError('Invalid email', 400));

  // generate reset token
  token = user.generatePasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // send it via email
  const resetLink = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${token}`;

  try {
    await sendMail({
      to: req.body.email,
      subject: 'Password reset link (expires in 10 minutes)',
      message: `
      Here is your password reset link:
      ${resetLink}
      Link expires in 10 minutes.
      If you didn't request it, simply ignore this mail.`,
    });

    res.status(200).json({
      status: 'success',
      message: 'Forgot password link sent to email!',
      token,
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to send email. Please try again later!',
    });
  }
});

exports.resetPassword = catchAsyncError(async (req, res, next) => {
  const { token: tokenRes } = req.params;
  const hashedToken = hashToken(tokenRes.trim());

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetTokenExpires: { $gt: Date.now() },
  });

  if (!user) return next(new AppError('Invalid token', 400));

  // save password

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpires = undefined;
  await user.save();

  const jwt = genUserJWT(user._id);

  res.status(200).json({
    status: 'success',
    token: jwt,
  });
});

/// ROUTES PROTECTION

exports.protectRoute = catchAsyncError(async (req, res, next) => {
  // 1) get the token out of the header
  if (
    !req.headers.authorization ||
    !req.headers.authorization.startsWith('Bearer')
  )
    return next(new AppError('Please log in to get access', 401));

  const token = req.headers.authorization.split(' ')[1]; // Bearer [token]

  //2) verify token jwt.verify(token.secret) - make a promise
  const { id, iat, exp } = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );

  // console.log(id, iat, exp);

  //3) check if user exists
  const currentUser = await User.findById(id);
  if (!currentUser)
    return next(
      new AppError('The user belonging to this token does not exist', 401)
    );

  //4) check if user changed pass in the meantime
  if (currentUser.hasChangedPassword(iat))
    return next(new AppError('User has changed password', 401));

  // Allow access
  req.user = currentUser;
  next();
});

exports.provideRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(new AppError('Access not granted', 403));

    next();
  };
};
