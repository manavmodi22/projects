import request from 'supertest';
import { app } from '../app';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('POST /api/posts', () => {
  const validPost = {
    textContent: 'Test post content',
    authorName: 'John Doe',
    authorProfileUrl: 'https://linkedin.com/in/johndoe',
    linkedinPostUrl: 'https://linkedin.com/post/123',
    originalPostDate: '2024-03-26T12:00:00Z',
    userId: 'user123'
  };

  it('should save a valid post', async () => {
    const response = await request(app)
      .post('/api/posts')
      .send(validPost)
      .expect(201);

    expect(response.body).toMatchObject({
      ...validPost,
      id: expect.any(String),
      createdAt: expect.any(String)
    });
  });

  it('should validate required fields', async () => {
    const response = await request(app)
      .post('/api/posts')
      .send({})
      .expect(400);

    expect(response.body).toHaveProperty('errors');
  });

  it('should not allow duplicate posts', async () => {
    // First save
    await request(app)
      .post('/api/posts')
      .send(validPost)
      .expect(201);

    // Try to save the same post again
    const response = await request(app)
      .post('/api/posts')
      .send(validPost)
      .expect(409);

    expect(response.body).toHaveProperty('error', 'Post already exists');
  });
}); 