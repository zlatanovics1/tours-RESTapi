const mongoose = require('mongoose');
const { default: slugify } = require('slugify');

const TourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name'],
    unique: true,
    trim: true,
    minLength: [5, 'Tour name should have at least 5 characters'],
    maxLength: [40, 'Tour name can not exceed 40 characters'],
  },
  slug: String,
  duration: {
    type: Number,
    required: [true, 'A tour must have a duration'],
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'A tour must have a group size'],
  },
  difficulty: {
    type: String,
    required: [true, 'A tour must have a difficulty'],
    enum: {
      values: ['easy', 'medium', 'difficult'],
      message: 'Difficulty can either be easy, medium or difficult',
    },
  },
  ratingsAverage: {
    type: Number,
    default: 4.5,
    validate: {
      validator: (val) => val >= 1 && val <= 5,
      message: 'Rating has to be between 1 and 5',
    },
  },
  ratingsQuantity: {
    type: Number,
    default: 0,
  },
  price: {
    type: Number,
    required: [true, 'A tour must have a price'],
    validate: {
      validator: (val) => val > 0,
      message: 'Price has to be greater then zero',
    },
  },
  priceDiscount: {
    type: Number,
    validate: {
      validator: function (val) {
        return val < this.price;
      },
      message: 'Discount price has to be lower then tour price',
    },
  },
  summary: {
    type: String,
    trim: true,
    required: [true, 'A tour must have a description'],
  },
  description: {
    type: String,
    trim: true,
  },
  imageCover: {
    type: String,
    required: [true, 'A tour must have a cover image'],
  },
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  startDates: [Date],
  secretTour: {
    type: Boolean,
    default: false,
  },
});

//  DOCUMENT MIDDLEWARE
TourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

//  QUERY MIDDLEWARE
TourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  next();
});

//  AGGREGATION MIDDLEWARE
TourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({
    $match: { secretTour: { $ne: true } },
  });
  next();
});

const Tour = new mongoose.model('Tour', TourSchema);
module.exports = Tour;
