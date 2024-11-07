require('dotenv').config(); // Load environment variables

const config = {
  connectionString: process.env.MONGODB_URI, // MongoDB connection string from the .env file
  port: process.env.PORT || 8000,            // Other configurations
};

module.exports = config;
