const dotenv = require('dotenv');
const fs = require('fs');
const mongoose = require('mongoose');
const Tour = require('./../../models/tourModel');

dotenv.config({ path: `./config.env` });

const DB = process.env.DB_URL;
mongoose
  .connect(DB)
  .then(() => console.log('Database connection established successfully!'));

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8')
);

const importTours = async () => {
  try {
    await Tour.create(tours);
    console.log('Tours imported!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

const deleteTours = async () => {
  try {
    await Tour.deleteMany();
    console.log('Tours deleted!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') importTours();
else if (process.argv[2] === '--delete') deleteTours();
