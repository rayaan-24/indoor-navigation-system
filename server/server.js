const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Connect to MongoDB Database
  await connectDB();

  // Start HTTP listener
  app.listen(PORT, () => {
    console.log(`Server is running in development mode on port ${PORT}`);
  });
};

startServer();
