import { z } from 'zod';
import { Types } from 'mongoose';

/** Reusable Zod refinement for MongoDB ObjectId strings */
export const objectId = z.string().refine(
  (val) => Types.ObjectId.isValid(val),
  { message: 'Invalid ObjectId' },
);

// ---- Comment schemas ----
export const addCommentSchema = z.object({
  text: z.string().min(1, 'Comment text is required').max(500),
});

// ---- Message schemas ----
export const sendMessageSchema = z.object({
  recipientId: objectId,
  text: z.string().min(1, 'Message text is required').max(2000),
});

// ---- Post schemas ----
export const createPostSchema = z.object({
  description: z.string().max(200, 'Description cannot exceed 200 characters').optional(),
});

export const updatePostSchema = z.object({
  description: z.string().max(200, 'Description cannot exceed 200 characters').optional(),
});

// ---- User profile schemas ----
export const updateProfileSchema = z.object({
  username: z.string().min(2).max(30).optional(),
  fullName: z.string().min(1).max(50).optional(),
  bio: z.string().max(150).optional(),
  website: z.string().max(200).optional(),
});
