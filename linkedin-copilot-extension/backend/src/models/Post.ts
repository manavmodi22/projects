import { Collection, Db } from 'mongodb';
import { DatabaseConfig } from '../config/database';

export interface Post {
  _id?: string;
  textContent: string;
  authorName: string;
  authorProfileUrl: string;
  linkedinPostUrl: string;
  originalPostDate: string;
  userId: string;
  createdAt?: Date;
}

class PostModel {
  private static instance: PostModel;
  private collection: Collection<Post>;

  private constructor() {
    const database = DatabaseConfig.getInstance().getDatabase();
    this.collection = database.collection<Post>('posts');
    console.log('PostModel initialized with collection:', this.collection.collectionName);
  }

  static getInstance(): PostModel {
    if (!PostModel.instance) {
      PostModel.instance = new PostModel();
    }
    return PostModel.instance;
  }

  async create(post: Post): Promise<Post> {
    const result = await this.collection.insertOne({
      ...post,
      createdAt: new Date()
    });
    return { ...post, _id: result.insertedId, createdAt: new Date() };
  }

  async findByUrlAndUser(linkedinPostUrl: string, userId: string): Promise<Post | null> {
    return this.collection.findOne({ linkedinPostUrl, userId });
  }

  async findByUserId(userId: string): Promise<Post[]> {
    console.log('Finding posts for userId:', userId);
    try {
      const posts = await this.collection
        .find({ userId })
        // .sort({ createdAt: -1 }) // Removed due to Cosmos DB index error
        .toArray();
      console.log('Found posts:', posts);
      return posts;
    } catch (error) {
      console.error('Error in findByUserId:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const Post = PostModel.getInstance(); 