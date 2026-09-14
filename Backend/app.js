```js
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const mongoose = require('mongoose');

require('dotenv').config();

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const app = express();

// ================================
// Middleware
// ================================

app.use(cors({
  origin: '*'
}));

app.use(logger('dev'));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());


// ================================
// Static Files
// ================================

app.use(
  express.static(path.join(__dirname, 'public'))
);


// ================================
// API Routes
// ================================

app.use('/', indexRouter);
app.use('/users', usersRouter);


// ================================
// 404 Handler
// ================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});


// ================================
// Global Error Handler
// ================================

app.use((err, req, res, next) => {
  console.error('Error:', err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});


// ================================
// MongoDB Connection
// ================================

if (!process.env.MONGO_URI) {
  console.error('❌ MONGO_URI is not defined in environment variables');
} else {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      console.log('✅ MongoDB is Connected');
    })
    .catch((error) => {
      console.error('❌ MongoDB connection error:', error.message);
    });
}


// ================================
// Start Server
// ================================

const port = process.env.PORT || 2556;

app.listen(port, '0.0.0.0', () => {
  console.log(`✅ Server is running on port ${port}`);
});


// ================================
// Export App
// ================================

module.exports = app;
```

