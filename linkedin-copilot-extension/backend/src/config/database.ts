import { MongoClient, Db } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
const result = dotenv.config();
console.log('Environment loading result:', result);
console.log('Current working directory:', process.cwd());
console.log('Looking for .env in:', path.resolve(process.cwd(), '.env'));

export class DatabaseConfig {
  private static instance: DatabaseConfig;
  private client: MongoClient;
  private database: Db;

  private constructor() {
    const connectionString = process.env.COSMOS_CONNECTION_STRING;
    const databaseId = process.env.COSMOS_DATABASE_ID || 'linkedin-copilot';

    console.log('Environment variables:');
    console.log('COSMOS_CONNECTION_STRING:', connectionString ? 'Present' : 'Missing');
    console.log('COSMOS_DATABASE_ID:', databaseId);
    console.log('All environment variables:', process.env);

    if (!connectionString) {
      throw new Error('Cosmos DB connection string missing');
    }

    this.client = new MongoClient(connectionString);
    this.database = this.client.db(databaseId);
  }

  static getInstance(): DatabaseConfig {
    if (!DatabaseConfig.instance) {
      DatabaseConfig.instance = new DatabaseConfig();
    }
    return DatabaseConfig.instance;
  }

  getDatabase(): Db {
    return this.database;
  }

  async initialize(): Promise<void> {
    try {
      await this.client.connect();
      console.log('Connected to Azure Cosmos DB');
    } catch (error) {
      console.error('Failed to connect to Azure Cosmos DB:', error);
      throw error;
    }
  }

  async close(): Promise<void> {
    await this.client.close();
  }
} 