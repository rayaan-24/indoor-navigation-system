const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load env parameters
dotenv.config();

const app = express();

// Configure CORS
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Enable body parser
app.use(express.json());

// API Status Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'IndoorNav API is running'
  });
});

// Import nested-compliant controller helpers
const { getFloorsByBuilding } = require('./controllers/floorController');
const { getRoomsByBuilding, getRoomsByFloor } = require('./controllers/roomController');
const { getLandmarksByFloor } = require('./controllers/landmarkController');

// Nested API mappings
app.get('/api/buildings/:buildingId/floors', getFloorsByBuilding);
app.get('/api/buildings/:buildingId/rooms', getRoomsByBuilding);
app.get('/api/floors/:floorId/rooms', getRoomsByFloor);
app.get('/api/floors/:floorId/landmarks', getLandmarksByFloor);

// Register base routers
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/navigation', require('./routes/navigationRoutes'));
app.use('/api/connections', require('./routes/connectionRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/buildings', require('./routes/buildingRoutes'));
app.use('/api/floors', require('./routes/floorRoutes'));
app.use('/api/rooms', require('./routes/roomRoutes'));
app.use('/api/landmarks', require('./routes/landmarkRoutes'));
app.use('/api/routes', require('./routes/routeRoutes'));
app.use('/api/feedback', require('./routes/feedbackRoutes'));
app.use('/api/favorites', require('./routes/favoriteRoutes'));
app.use('/api/history', require('./routes/historyRoutes'));
app.use('/api/search', require('./routes/searchRoutes'));

// 404 Unknown Route mapping
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Resource endpoint not found'
  });
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error('Error stack:', err.stack);
  
  const status = err.status || 500;
  let message = err.message || 'Internal Server Error';
  
  if (status === 500 && process.env.NODE_ENV === 'production') {
    message = 'Something went wrong. Please try again later.';
  }
  
  res.status(status).json({
    success: false,
    message
  });
});

module.exports = app;
