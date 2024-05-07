const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');

const ToursRouter = require('./routes/toursRoutes');
const UserRouter = require('./routes/userRoutes');
const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');

const app = express();

// http secure headers
app.use(helmet());

// rate limiting
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000, // one hour
  message: 'Too many requests. Try again in an hour...',
});
app.use('/api', limiter);

// Body parser and serving static files
app.use(express.json({ limit: '10kb' }));
app.use(express.static(`${__dirname}/public`));

// Data sanitization
app.use(mongoSanitize());
app.use(xss());

// Parameter pollution
app.use(hpp());

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
