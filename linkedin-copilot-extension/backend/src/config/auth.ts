import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from '../models/User';

export const configurePassport = () => {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: process.env.GOOGLE_CALLBACK_URL!,
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user exists
      let user = await User.findByGoogleId(profile.id);
      
      if (!user) {
        // Create new user
        user = await User.create({
          googleId: profile.id,
          email: profile.emails![0].value,
          name: profile.displayName,
        });
      }
      
      return done(null, user);
    } catch (error) {
      return done(error as Error);
    }
  }));

  // Serialize user to store in session
  passport.serializeUser((user: any, done) => {
    console.log('Serializing user:', user);
    done(null, user._id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id: string, done) => {
    try {
      console.log('Deserializing user with id:', id);
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      console.error('Error deserializing user:', error);
      done(error);
    }
  });
}; 