const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

// Handling global uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error(err.name, err.message);
  process.exit(1);
});
//

const app = require('./app');
const mongoose = require('mongoose');

const DB = process.env.DB_URL;
mongoose
  .connect(DB)
  .then(() => console.log('Database connection established successfully!'));

const server = app.listen(process.env.PORT, () =>
  console.log(`Listening on port 8000`)
);

// Handling global unhandled rejections
process.on('unhandledRejection', (err) => {
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
