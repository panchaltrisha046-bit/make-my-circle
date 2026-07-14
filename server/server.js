// File Name: server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Declare routes cleanly (only once!)
const userRoutes = require('./routes/userroutes'); // Matches your file 'userroutes.js'
const requestRoutes = require('./routes/requestroutes'); // Matches your file 'requestroutes.js'

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static profile pictures publicly
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes mapping
app.use('/api/users', userRoutes);
app.use('/api/requests', requestRoutes); // Mount friend requests route system here

// Connect to MongoDB using Native Promises
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/makemycircle';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB database successfully.');
    app.listen(PORT, () => console.log(`Server executing safely on port: ${PORT}`));
  })
  .catch((err) => {
    console.error('Database connection system failure:', err.message);
  });