require('dotenv').config();

// This is .env configuration file we are 
module.exports = {
  port: process.env.PORT || 6587,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET || 'secretKey', 
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS || process.env.Pass,
  }
};
