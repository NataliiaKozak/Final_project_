import request from 'supertest';
import app from '../../app';

describe('Auth endpoints', () => {
  describe('POST /api/auth/register', () => {
    it('should reject registration with missing fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'a' }); // missing email, password, fullName

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message');
    });

    it('should reject registration with invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'not-an-email',
          password: 'password123',
          fullName: 'Test User',
        });

      expect(res.status).toBe(400);
    });

    it('should reject registration with short password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: '12',
          fullName: 'Test User',
        });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should reject login with missing credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(res.status).toBe(400);
    });

    it('should reject login with empty password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ emailOrUsername: 'test@example.com', password: '' });

      expect(res.status).toBe(400);
    });
  });

  describe('Protected endpoints', () => {
    it('should reject unauthorized access to POST /api/posts', async () => {
      const res = await request(app).post('/api/posts');
      expect(res.status).toBe(401);
    });

    it('should reject unauthorized access to POST /api/messages', async () => {
      const res = await request(app)
        .post('/api/messages')
        .send({ recipientId: '507f1f77bcf86cd799439011', text: 'hello' });
      expect(res.status).toBe(401);
    });

    it('should reject unauthorized access to POST /api/likes/post/507f1f77bcf86cd799439011', async () => {
      const res = await request(app).post('/api/likes/post/507f1f77bcf86cd799439011');
      expect(res.status).toBe(401);
    });
  });

  describe('ObjectId validation', () => {
    it('should reject invalid ObjectId in GET /api/posts/:id (returns 401 without auth)', async () => {
      const res = await request(app).get('/api/posts/invalid-id');
      // Auth middleware runs first, so unauthenticated request returns 401
      expect(res.status).toBe(401);
    });

    it('should reject invalid ObjectId in GET /api/comments/post/invalid-id', async () => {
      const res = await request(app).get('/api/comments/post/invalid-id');
      expect(res.status).toBe(400);
    });
  });
});
