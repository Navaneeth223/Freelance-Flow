import app from './app';
import { connectDB } from './config/db';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Connect database
  await connectDB();

  // Start Express server
  app.listen(PORT, () => {
    console.log(`FreelanceFlow API running in development mode on port ${PORT}`);
  });
};

startServer();
