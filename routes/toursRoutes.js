const express = require('express');
const toursController = require('../controllers/toursController');

const toursRouter = express.Router();
// toursRouter.param('id', toursController.checkId);

toursRouter
  .route('/')
  .get(toursController.getAllTours)
  .post(toursController.postNewTour);

toursRouter
  .route('/top-5-tours')
  .get(toursController.getTop5Tours, toursController.getAllTours);

toursRouter.route('/tours-stats').get(toursController.getToursStats);
toursRouter.route('/monthly-plan/:year').get(toursController.getMonthlyPlan);

toursRouter
  .route('/:id')
  .get(toursController.getTourById)
  .patch(toursController.updateTour)
  .delete(toursController.deleteTour);

module.exports = toursRouter;
