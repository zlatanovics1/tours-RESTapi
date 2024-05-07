const mongoose = require('mongoose');
const crypto = require('crypto');

const {
  hashPassword,
  comparePasswords,
  hashToken,
} = require('../utils/helpers');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your name'],
    minLenght: 3,
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowerCase: true,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    select: false,
    minLength: 8,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      validator: function (val) {
        return this.password === val;
      },
      message: 'Passwords do not match',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetTokenExpires: Date,
  photo: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  active: {
    type: Boolean,
    select: false,
    default: true,
  },
});

// document middelware
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await hashPassword(this.password);
  this.passwordConfirm = undefined;

  next();
});

UserSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;

  next();
});

//query middleware
UserSchema.pre(/^find/, function (next) {
  this.select({ active: { $ne: false } });
  next();
});

UserSchema.methods.validatePassword = async function (enteredPassword) {
  return await comparePasswords(enteredPassword, this.password);
};

UserSchema.methods.hasChangedPassword = function (tokenIssuedAt) {
  if (!this.passwordChangedAt) return false;

  const changedAt = parseInt(this.passwordChangedAt.getTime() / 1000, 10);

  return changedAt > tokenIssuedAt;
};

UserSchema.methods.generatePasswordResetToken = function () {
  const token = crypto.randomBytes(32).toString('hex');
  const hashedToken = hashToken(token);

  this.passwordResetToken = hashedToken;
  this.passwordResetTokenExpires =
    Date.now() + Number(process.env.RESET_TOKEN_EXPIRES_IN); // 10min

  return token;
};

const User = new mongoose.model('User', UserSchema);

module.exports = User;
