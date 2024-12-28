import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { generateEmbeddings } from './knowledge.controller';


export const createGlossary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, sourceLanguage, targetLanguage, userId } = req.body;
    if (!name || !description || !sourceLanguage || !targetLanguage || !userId) {
      throw new Error('Glossary name is required');
    }

    const glossary = await prisma.knowledgeBase.create({
      data: {
        name,
        description,
        sourceLanguage,
        targetLanguage,
        userId,
      },
    });

    res.status(201).json({ status: 'success', data: glossary });
  } catch (error) {
    next(error);
  }
};

export const addGlossaryEntry = async (req: Request, res: Response) => {
  const { sourceText, targetText, context, category } = req.body;

  try {
    const embedding = await generateEmbeddings(sourceText);

    const newEntry = await prisma.glossaryEntry.create({
      data: {
        sourceText,
        targetText,
        context,
        category,
        embedding,
      },
    });

    res.status(201).json({ status: 'success', data: newEntry });
  } catch (error) {
    console.error('Erro ao adicionar entrada do glossário:', error);
    res.status(500).json({ error: 'Erro ao adicionar entrada do glossário' });
  }
};
