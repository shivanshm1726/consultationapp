require('dotenv').config({ path: './server/.env' });
const mongoose = require('mongoose');

console.log("URI from .env:", process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("SUCCESS: Connected to MongoDB successfully from the terminal!");
    process.exit(0);
  })
  .catch(err => {
    console.error("ERROR CONNECTING:");
    console.error(err);
    process.exit(1);
  });
