const express = require('express');
const authController = require('./../controllers/authenticationController');
const userController = require('./../controllers/userController');

const UserRouter = express.Router();

///// UserController
UserRouter.route('/').get(userController.getUsers);

UserRouter.route('/updateUser').patch(
  authController.protectRoute,
  userController.updateUser
);
UserRouter.route('/deleteUser').delete(
  authController.protectRoute,
  userController.deleteUser
);

UserRouter.route('/:id')
  .get(userController.getUserById)
  .delete(userController.deleteUser);

///// AuthController
UserRouter.route('/signup').post(authController.signup);
UserRouter.route('/login').post(authController.login);

UserRouter.route('/forgotPassword').post(authController.forgotPassword);
UserRouter.route('/resetPassword/:token').patch(authController.resetPassword);
UserRouter.route('/updatePassword').patch(
  authController.protectRoute,
  authController.updatePassword
);

module.exports = UserRouter;
