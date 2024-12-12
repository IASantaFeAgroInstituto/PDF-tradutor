import { Request, Response } from 'express';
import { z } from 'zod';
import path from 'path';
import prisma from '../config/database';
import { AuthRequest } from '../middlewares/auth';
import { NotFoundError } from '../utils/errors';
import { asyncHandler } from '../utils/asyncHandler';
import { processTranslation } from '../services/translation.service';

const createTranslationSchema = z.object({
  sourceLanguage: z.string(),
  targetLanguage: z.string(),
});

export const createTranslation = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { sourceLanguage, targetLanguage } = createTranslationSchema.parse(req.body);
  
  if (!req.file) {
    throw new Error('No file uploaded');
  }

  const translation = await prisma.translation.create({
    data: {
      fileName: req.file.filename,
      originalName: req.file.originalname,
      sourceLanguage,
      targetLanguage,
      status: 'pending',
      progress: 0,
      userId: req.user!.id,
      originalSize: req.file.size,
    },
  });

  // Start translation process in background
  processTranslation(translation.id).catch(console.error);

  res.status(201).json(translation);
});

export const getTranslations = asyncHandler(async (req: AuthRequest, res: Response) => {
  const translations = await prisma.translation.findMany({
    where: { userId: req.user!.id },
    orderBy: { createdAt: 'desc' },
  });

  res.json(translations);
});

export const getTranslation = asyncHandler(async (req: AuthRequest, res: Response) => {
  const translation = await prisma.translation.findFirst({
    where: {
      id: req.params.id,
      userId: req.user!.id,
    },
  });

  if (!translation) {
    throw new NotFoundError('Translation not found');
  }

  res.json(translation);
});