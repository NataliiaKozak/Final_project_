import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../validation/authSchemas';
import { addCommentSchema, sendMessageSchema, objectId } from '../validation/commonSchemas';

describe('Auth validation schemas', () => {
  describe('registerSchema', () => {
    it('should accept valid registration data', () => {
      const result = registerSchema.safeParse({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        fullName: 'Test User',
      });
      expect(result.success).toBe(true);
    });

    it('should reject short username', () => {
      const result = registerSchema.safeParse({
        username: 'a',
        email: 'test@example.com',
        password: 'password123',
        fullName: 'Test User',
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid email', () => {
      const result = registerSchema.safeParse({
        username: 'testuser',
        email: 'not-an-email',
        password: 'password123',
        fullName: 'Test User',
      });
      expect(result.success).toBe(false);
    });

    it('should reject short password', () => {
      const result = registerSchema.safeParse({
        username: 'testuser',
        email: 'test@example.com',
        password: '123',
        fullName: 'Test User',
      });
      expect(result.success).toBe(false);
    });

    it('should reject empty fullName', () => {
      const result = registerSchema.safeParse({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        fullName: '',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('loginSchema', () => {
    it('should accept valid login', () => {
      const result = loginSchema.safeParse({
        emailOrUsername: 'test@example.com',
        password: 'password123',
      });
      expect(result.success).toBe(true);
    });

    it('should reject empty password', () => {
      const result = loginSchema.safeParse({
        emailOrUsername: 'test@example.com',
        password: '',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('forgotPasswordSchema', () => {
    it('should accept valid email', () => {
      const result = forgotPasswordSchema.safeParse({ email: 'user@test.com' });
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const result = forgotPasswordSchema.safeParse({ email: 'bad' });
      expect(result.success).toBe(false);
    });
  });

  describe('resetPasswordSchema', () => {
    it('should accept valid data', () => {
      const result = resetPasswordSchema.safeParse({
        token: 'some-token',
        newPassword: 'newpass123',
      });
      expect(result.success).toBe(true);
    });

    it('should reject short password', () => {
      const result = resetPasswordSchema.safeParse({
        token: 'some-token',
        newPassword: '123',
      });
      expect(result.success).toBe(false);
    });
  });
});

describe('Common validation schemas', () => {
  describe('objectId', () => {
    it('should accept valid ObjectId', () => {
      const result = objectId.safeParse('507f1f77bcf86cd799439011');
      expect(result.success).toBe(true);
    });

    it('should reject invalid ObjectId', () => {
      const result = objectId.safeParse('not-an-objectid');
      expect(result.success).toBe(false);
    });

    it('should reject empty string', () => {
      const result = objectId.safeParse('');
      expect(result.success).toBe(false);
    });
  });

  describe('addCommentSchema', () => {
    it('should accept valid comment', () => {
      const result = addCommentSchema.safeParse({ text: 'Nice photo!' });
      expect(result.success).toBe(true);
    });

    it('should reject empty text', () => {
      const result = addCommentSchema.safeParse({ text: '' });
      expect(result.success).toBe(false);
    });

    it('should reject text over 500 chars', () => {
      const result = addCommentSchema.safeParse({ text: 'a'.repeat(501) });
      expect(result.success).toBe(false);
    });
  });

  describe('sendMessageSchema', () => {
    it('should accept valid message', () => {
      const result = sendMessageSchema.safeParse({
        recipientId: '507f1f77bcf86cd799439011',
        text: 'Hello!',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid recipientId', () => {
      const result = sendMessageSchema.safeParse({
        recipientId: 'bad-id',
        text: 'Hello!',
      });
      expect(result.success).toBe(false);
    });

    it('should reject empty text', () => {
      const result = sendMessageSchema.safeParse({
        recipientId: '507f1f77bcf86cd799439011',
        text: '',
      });
      expect(result.success).toBe(false);
    });
  });
});
