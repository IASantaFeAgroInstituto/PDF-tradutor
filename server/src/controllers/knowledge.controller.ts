import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../config/database';
import { AuthRequest } from '../middlewares/auth';
import { NotFoundError } from '../utils/errors';
import { asyncHandler } from '../utils/asyncHandler';

const createKnowledgeBaseSchema = z.object({
  name: z.string(),
  description: z.string(),
  sourceLanguage: z.string(),
  targetLanguage: z.string(),
});

export const createKnowledgeBase = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = createKnowledgeBaseSchema.parse(req.body);

  const knowledgeBase = await prisma.knowledgeBase.create({
    data: {
      ...data,
      userId: req.user!.id,
    },
  });

  res.status(201).json(knowledgeBase);
});

export const getKnowledgeBases = asyncHandler(async (req: AuthRequest, res: Response) => {
  const knowledgeBases = await prisma.knowledgeBase.findMany({
    where: { userId: req.user!.id },
    include: { entries: true },
  });

  res.json(knowledgeBases);
});

const createEntrySchema = z.object({
  sourceText: z.string(),
  targetText: z.string(),
  context: z.string().optional(),
  category: z.string().optional(),
});

export const addEntry = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const data = createEntrySchema.parse(req.body);

  const knowledgeBase = await prisma.knowledgeBase.findFirst({
    where: { id, userId: req.user!.id },
  });

  if (!knowledgeBase) {
    throw new NotFoundError('Knowledge base not found');
  }

  const entry = await prisma.glossaryEntry.create({
    data: {
      ...data,
      knowledgeBaseId: id,
    },
  });

  res.status(201).json(entry);
});