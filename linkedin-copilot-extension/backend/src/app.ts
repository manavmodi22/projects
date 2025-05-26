import express from 'express';
import cors from 'cors';
import { DatabaseConfig } from './config/database';
import postsRouter from './routes/posts';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database
const dbConfig = DatabaseConfig.getInstance();
dbConfig.initialize().catch(console.error);

// Routes
app.use('/api/posts', postsRouter);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

export default app; 