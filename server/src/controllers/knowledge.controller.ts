import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '../utils/asyncHandler';
import { z } from 'zod';
import { parse, unparse } from 'papaparse';
import { Configuration, OpenAIApi } from 'openai';
import * as fs from 'fs';
import csvParser from 'csv-parser';



const prisma = new PrismaClient();

const openai = new OpenAIApi(new Configuration({
  apiKey: process.env.OPENAI_API_KEY, // Certifique-se de que a variável está configurada no .env
}));

export async function generateEmbeddings(text: string): Promise<number[]> {
  const response = await openai.createEmbedding({
    model: 'text-embedding-ada-002',
    input: text,
  });
  return response.data.data[0].embedding;
}

const createKnowledgeBaseSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string(),
  sourceLanguage: z.string().min(2, 'Source language is required'),
  targetLanguage: z.string().min(2, 'Target language is required'),
  entries: z.array(z.object({
    sourceText: z.string().min(1, 'Source text is required'),
    targetText: z.string().min(1, 'Target text is required'),
    context: z.string().optional(),
    category: z.string().optional(),
  })).optional(),
});

export const createKnowledgeBase = asyncHandler(async (req: Request, res: Response) => {
  const validatedData = createKnowledgeBaseSchema.parse(req.body);
  const userId = req.user?.id;

  if (!userId) {
    throw new Error('User not authenticated');
  }

  const knowledgeBase = await prisma.knowledgeBase.create({
    data: {
      name: validatedData.name,
      description: validatedData.description,
      sourceLanguage: validatedData.sourceLanguage,
      targetLanguage: validatedData.targetLanguage,
      userId,
      entries: validatedData.entries ? {
        createMany: {
          data: validatedData.entries.map(entry => ({
            sourceText: entry.sourceText,
            targetText: entry.targetText,
            context: entry.context,
            category: entry.category,
          })),
        },
      } : undefined,
    },
    include: {
      entries: true,
    },
  });

  res.status(201).json({
    status: 'success',
    data: knowledgeBase,
  });
});

export const importEntries = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const file = req.file;

  if (!file) {
    throw new Error('No file uploaded');
  }

  if (file.mimetype !== 'text/csv') {
    throw new Error('Invalid file format. Please upload a CSV file');
  }

  const csvString = file.buffer.toString('utf-8');
  const parseResult = parse(csvString, {
    header: true,
    skipEmptyLines: true,
  });

  if (parseResult.errors.length > 0) {
    throw new Error('Invalid CSV format');
  }

  const entries = (parseResult.data as any[]).map(row => ({
    sourceText: row.sourceText,
    targetText: row.targetText,
    context: row.context,
    category: row.category,
  }));

  const updatedKnowledgeBase = await prisma.knowledgeBase.update({
    where: { id },
    data: {
      entries: {
        createMany: {
          data: entries,
        },
      },
    },
    include: {
      entries: true,
    },
  });

  res.json({
    status: 'success',
    data: updatedKnowledgeBase,
  });
});

export const exportEntries = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const knowledgeBase = await prisma.knowledgeBase.findUnique({
    where: { id },
    include: {
      entries: true,
    },
  });

  if (!knowledgeBase) {
    throw new Error('Knowledge base not found');
  }

  const csvData = knowledgeBase.entries.map(entry => ({
    sourceText: entry.sourceText,
    targetText: entry.targetText,
    context: entry.context || '',
    category: entry.category || '',
  }));

  const csvString = unparse(csvData);

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="knowledge-base-${id}.csv"`);
  res.send(csvString);
});

export const getKnowledgeBase = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const knowledgeBase = await prisma.knowledgeBase.findUnique({
    where: { id },
    include: {
      entries: true,
    },
  });

  if (!knowledgeBase) {
    throw new Error('Knowledge base not found');
  }

  res.json({
    status: 'success',
    data: knowledgeBase,
  });
});

export const updateKnowledgeBase = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const validatedData = createKnowledgeBaseSchema.partial().parse(req.body);

  const knowledgeBase = await prisma.knowledgeBase.update({
    where: { id },
    data: {
      name: validatedData.name,
      description: validatedData.description,
      sourceLanguage: validatedData.sourceLanguage,
      targetLanguage: validatedData.targetLanguage,
      entries: validatedData.entries ? {
        createMany: {
          data: validatedData.entries.map(entry => ({
            sourceText: entry.sourceText,
            targetText: entry.targetText,
            context: entry.context,
            category: entry.category,
          })),
        },
      } : undefined,
    },
    include: {
      entries: true,
    },
  });

  res.json({
    status: 'success',
    data: knowledgeBase,
  });
});

export const deleteKnowledgeBase = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  await prisma.knowledgeBase.delete({
    where: { id },
  });

  res.json({
    status: 'success',
    message: 'Knowledge base deleted successfully',
  });
});

export const processKnowledgeFile = async (req: Request, res: Response) => {
  const { file } = req;
  if (!file) return res.status(400).json({ error: 'Nenhum arquivo enviado' });

  const data: any[] = [];

  if (file.mimetype === 'text/csv') {
    fs.createReadStream(file.path)
      .pipe(csvParser())
      .on('data', (row) => data.push(row))
      .on('end', async () => {
        try {
          const processedEntries = await Promise.all(data.map(async (entry) => ({
            sourceText: entry.sourceText,
            targetText: entry.targetText,
            context: entry.context || null,
            category: entry.category || null,
            embedding: await generateEmbeddings(entry.sourceText),
            knowledgeBaseId: req.body.knowledgeBaseId,
          })));

          await prisma.glossaryEntry.createMany({ data: processedEntries });
          res.status(200).json({ message: 'Base de conhecimento processada com sucesso!' });
        } catch (error) {
          console.error('Erro ao processar arquivo:', error);
          res.status(500).json({ error: 'Erro ao processar arquivo' });
        }
      });
  } else {
    res.status(400).json({ error: 'Formato de arquivo não suportado' });
  }
};