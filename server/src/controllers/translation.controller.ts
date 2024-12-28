import { Request, Response } from 'express';
import { z } from 'zod';
import path from 'path';
import prisma from '../config/database';
import { AuthRequest } from '../middlewares/auth';
import { NotFoundError } from '../utils/errors';
import { asyncHandler } from '../utils/asyncHandler';
import { updateTranslationProgress, translateFileWithOpenAI } from "../services/translation.service";
import openai from '../config/openai';
import fs from 'fs';
import pdfParse from 'pdf-parse";


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
  updateTranslationProgress(translation.id).catch(console.error);

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



export const translateDocument = async (req: Request, res: Response) => {
  const { sourceLanguage, targetLanguage } = req.body;
  const file = req.file;

  if (!file || !sourceLanguage || !targetLanguage) {
    return res.status(400).json({ error: 'Arquivo e linguagens são obrigatórios.' });
  }

  try {
    // Leia o conteúdo do arquivo (adicionando suporte para PDFs)
    const filePath = path.resolve(file.path);
    const fileContent = file.mimetype === 'application/pdf'
      ? (await pdfParse(fs.readFileSync(filePath))).text
      : fs.readFileSync(filePath, 'utf-8');

    // Traduza o conteúdo usando a API da OpenAI
    const response = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `Você é um tradutor que converte texto do ${sourceLanguage} para ${targetLanguage}.`,
        },
        { role: 'user', content: fileContent },
      ],
    });

    const translatedText = response.data.choices[0].message?.content;

    // Retorne o texto traduzido
    return res.status(200).json({ translatedText });
  } catch (error) {
    console.error('Erro na tradução:', error);
    return res.status(500).json({ error: 'Erro na tradução do documento.' });
  } finally {
    // Remova o arquivo após o processamento
    fs.unlinkSync(file.path);
  }
};