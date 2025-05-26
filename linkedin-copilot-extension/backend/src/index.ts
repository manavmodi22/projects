import dotenv from 'dotenv';
import app from './app';
import { DatabaseConfig } from './config/database';

// Load environment variables
const result = dotenv.config();
if (result.error) {
  console.error('Error loading .env file:', result.error);
  process.exit(1);
}

console.log('Environment loaded from:', result.parsed ? '.env file' : 'process.env');

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Initialize database
    const dbConfig = DatabaseConfig.getInstance();
    await dbConfig.initialize();
    console.log('Connected to Azure Cosmos DB');

    // Start server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer(); 