import { Router } from 'express';
import { z } from 'zod';
import { Post } from '../models/Post';

const router = Router();

// Validation schema for post data
const postSchema = z.object({
  textContent: z.string().min(1),
  authorName: z.string().min(1),
  authorProfileUrl: z.string().url(),
  linkedinPostUrl: z.string().url(),
  originalPostDate: z.string(),
  userId: z.string().min(1)
});

// POST /api/posts - Save a new post
router.post('/', async (req, res) => {
  try {
    const postData = postSchema.parse(req.body);
    
    // Check for duplicate post
    const existingPost = await Post.findByUrlAndUser(postData.linkedinPostUrl, postData.userId);
    if (existingPost) {
      return res.status(409).json({ error: 'Post already saved' });
    }

    const post = await Post.create(postData);
    res.status(201).json(post);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Error saving post:', error);
    res.status(500).json({ error: 'Failed to save post' });
  }
});

// GET /api/posts?userId=xxx - Get all posts for a user
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'userId query parameter is required' });
    }

    const posts = await Post.findByUserId(userId);
    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

export default router; 