const express = require('express');
const morgan = require('morgan');
const app = express();
const ToursRouter = require('./routes/toursRoutes');
const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');
const UserRouter = require('./routes/userRoutes');

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

// console logs for REQUESTS
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

//////  1) ROUTERS  ///////
//
//
app.use('/api/v1/tours', ToursRouter);
app.use('/api/v1/users', UserRouter);
//
//
//////////////////////////////////////

/////  2) ERROR HANDLING  //////
//
//
app.all('*', (req, res, next) => {
  next(new AppError(`Could not find ${req.originalUrl} on the server!`, 404));
});

app.use(globalErrorHandler);
//
//
////////////////////////////////

module.exports = app;
