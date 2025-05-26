import { Collection, Db, ObjectId } from 'mongodb';
import { DatabaseConfig } from '../config/database';

export interface User {
  _id?: ObjectId;
  googleId: string;
  email: string;
  name: string;
  createdAt: Date;
}

class UserModel {
  private static instance: UserModel;
  private collection: Collection<User>;

  private constructor() {
    const database = DatabaseConfig.getInstance().getDatabase();
    this.collection = database.collection<User>('users');
  }

  static getInstance(): UserModel {
    if (!UserModel.instance) {
      UserModel.instance = new UserModel();
    }
    return UserModel.instance;
  }

  async create(user: Omit<User, '_id' | 'createdAt'>): Promise<User> {
    const result = await this.collection.insertOne({
      ...user,
      createdAt: new Date()
    });
    return { ...user, _id: result.insertedId, createdAt: new Date() };
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.collection.findOne({ googleId });
  }

  async findById(id: string): Promise<User | null> {
    try {
      const objectId = new ObjectId(id);
      const user = await this.collection.findOne({ _id: objectId });
      if (user) {
        return {
          ...user,
          _id: user._id
        };
      }
      return null;
    } catch (error) {
      console.error('Error in findById:', error);
      return null;
    }
  }
}

export const User = UserModel.getInstance(); 