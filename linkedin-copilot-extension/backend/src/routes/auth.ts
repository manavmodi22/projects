import { Router } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { ObjectId } from 'mongodb';

const router = Router();

router.get('/google',
  (req, res, next) => {
    console.log('Starting Google OAuth flow...');
    passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
  }
);

router.get('/google/callback',
  (req, res, next) => {
    console.log('Received Google OAuth callback...');
    passport.authenticate('google', { failureRedirect: '/login' })(req, res, next);
  },
  (req, res) => {
    console.log('OAuth successful, user:', req.user);
    
    if (!req.user || !('_id' in req.user)) {
      console.error('Authentication failed: No user or missing _id');
      return res.status(401).json({ error: 'Authentication failed' });
    }

    try {
      // Generate JWT token
      const token = jwt.sign(
        { id: (req.user as User)._id },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );

      console.log('JWT token generated successfully');
      
      // Redirect to extension with token
      const redirectUrl = `chrome-extension://${process.env.EXTENSION_ID}/popup.html?token=${token}`;
      console.log('Redirecting to:', redirectUrl);
      
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('Error generating JWT:', error);
      res.status(500).json({ error: 'Failed to generate authentication token' });
    }
  }
);

// Middleware to verify JWT token
export const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  jwt.verify(token, process.env.JWT_SECRET!, (err: any, user: any) => {
    if (err) {
      console.error('JWT verification failed:', err);
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Get current user info
router.get('/me', authenticateToken, async (req: any, res) => {
  try {
    console.log('Fetching user info for ID:', req.user.id);
    const userId = new ObjectId(req.user.id);
    const user = await User.findById(userId.toString());
    if (!user) {
      console.log('User not found for ID:', req.user.id);
      return res.status(404).json({ error: 'User not found' });
    }
    console.log('Found user:', user);
    res.json({
      id: user._id,
      name: user.name,
      email: user.email
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user information' });
  }
});

export default router; 