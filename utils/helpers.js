const bcrypt = require('bcryptjs');
const crypto = require('crypto');

exports.hashPassword = async (password) => await bcrypt.hash(password, 12);
exports.comparePasswords = async (enteredPassword, storedPassword) =>
  await bcrypt.compare(enteredPassword, storedPassword);

exports.hashToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');
