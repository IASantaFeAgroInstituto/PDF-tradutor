import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

export const validate = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          status: 'error',
          message: 'Validation error',
          errors: error.errors,
        });
      }
      next(error);
    }
  };
};

// Common validation schemas
import { z } from 'zod';

export const authSchemas = {
  login: z.object({
    body: z.object({
      email: z.string().email(),
      password: z.string().min(6),
    }),
  }),
  register: z.object({
    body: z.object({
      email: z.string().email(),
      password: z.string().min(6),
      name: z.string().min(2),
    }),
  }),
};

export const glossarySchemas = {
  create: z.object({
    body: z.object({
      name: z.string().min(1),
      sourceLanguage: z.string().min(2),
      targetLanguage: z.string().min(2),
      terms: z.array(z.object({
        source: z.string().min(1),
        target: z.string().min(1),
      })).optional(),
    }),
  }),
  update: z.object({
    params: z.object({
      id: z.string(),
    }),
    body: z.object({
      name: z.string().min(1).optional(),
      sourceLanguage: z.string().min(2).optional(),
      targetLanguage: z.string().min(2).optional(),
      terms: z.array(z.object({
        source: z.string().min(1),
        target: z.string().min(1),
      })).optional(),
    }),
  }),
};

export const translationSchemas = {
  create: z.object({
    body: z.object({
      sourceLanguage: z.string().min(2),
      targetLanguage: z.string().min(2),
      content: z.string().min(1),
      glossaryId: z.string().optional(),
    }),
  }),
  update: z.object({
    params: z.object({
      id: z.string(),
    }),
    body: z.object({
      status: z.enum(['pending', 'in_progress', 'completed', 'failed']).optional(),
      translatedContent: z.string().optional(),
    }),
  }),
};
