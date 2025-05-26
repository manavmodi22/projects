import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import { configurePassport } from './config/auth';
import authRouter from './routes/auth';
import postsRouter from './routes/posts';

const app = express();

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// Session configuration
const sessionMiddleware = session({
  secret: process.env.JWT_SECRET!,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
});

app.use(sessionMiddleware);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());
configurePassport();

// Routes
app.use('/api/auth', authRouter);
app.use('/api/posts', postsRouter);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error details:', {
    message: err.message,
    stack: err.stack,
    name: err.name
  });
  
  // Send detailed error in development
  if (process.env.NODE_ENV === 'development') {
    res.status(500).json({
      error: 'Something went wrong!',
      details: {
        message: err.message,
        name: err.name,
        stack: err.stack
      }
    });
  } else {
    res.status(500).json({ error: 'Something went wrong!' });
  }
});

export default app; 