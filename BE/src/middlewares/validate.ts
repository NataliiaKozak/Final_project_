import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

/** Express middleware: validate req.body against a Zod schema */
export const validate = (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const messages = err.issues.map((e: { message: string }) => e.message);
        res.status(400).json({ message: 'Validation error', errors: messages });
        return;
      }
      next(err);
    }
  };

  