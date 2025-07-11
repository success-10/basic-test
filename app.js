const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const connectDB = require('./config/db');
const retailRoutes = require('./routes/retailRoutes');
const authRoutes = require('./routes/authRoutes');
const summaryRoutes = require('./routes/summaryRoutes');
const { errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Connect DB
connectDB();

app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// Routes
app.use('/api/retail', retailRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/summary', summaryRoutes);

// Error Handler
app.use(errorHandler);

module.exports = app;
