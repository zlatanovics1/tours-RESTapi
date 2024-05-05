const Tour = require('../models/tourModel');
const AppError = require('../utils/appError');
const ApiFeatures = require('./../utils/apiFeatures');
const catchAsyncError = require('./../utils/catchAsyncError');

//////////  GET REQUESTS /////////////////
//
//
exports.getTop5Tours = catchAsyncError(async (req, res, next) => {
  req.query.sort = '-ratingsAverage price';
  req.query.limit = 5;
  next();
});

exports.getToursStats = catchAsyncError(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        // _id: null,
        _id: '$difficulty',
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        averageRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

exports.getMonthlyPlan = catchAsyncError(async (req, res) => {
  const year = +req.params.year;
  const results = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { month: { $month: '$startDates' }, difficulty: '$difficulty' },
        numTourStarts: { $sum: 1 },
        tours: {
          // $push: '$$ROOT', - WHOLE DOCUMENT
          $push: { name: '$name', duration: '$duration' },
        },
      },
    },
    {
      $addFields: {
        month: `$_id.month`,
        difficulty: '$_id.difficulty',
      },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { month: 1 },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      results,
    },
  });
});

exports.getAllTours = catchAsyncError(async (req, res) => {
  const tourQuery = Tour.find();
  const tourFeatures = new ApiFeatures(tourQuery, req.query);
  tourFeatures.filter().sort().limitFields().paginate();

  const tours = await tourFeatures.modelQuery;

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
});

exports.getTourById = catchAsyncError(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id, '-__v'); // exclude __v property (irrelevant)
  if (!tour) {
    return next(new AppError('Provided ID did not match any tour', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { tour },
  });
});
//
//
////////////////////////////////////////

//////////  POST REQUESTS /////////////////
//
//
exports.postNewTour = catchAsyncError(async (req, res, next) => {
  const newTour = await Tour.create(req.body);
  res.status(201).json({
    status: 'success',
    data: { tour: newTour },
  });
});
//
//
/////////////////////////////////////////

////////// PATCH REQUESTS /////////////////
//
//
exports.updateTour = catchAsyncError(async (req, res, next) => {
  const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    runValidators: true,
    new: true,
  });
  if (!updatedTour) {
    return next(new AppError('Provided ID did not match any tour', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour: updatedTour,
    },
  });
});
//
//
/////////////////////////////////////////

//////////  DELETE REQUESTS /////////////////
//
//
exports.deleteTour = catchAsyncError(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);
  if (!tour) {
    return next(new AppError('Provided ID did not match any tour', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
//
//
////////////////////////////////////////////
