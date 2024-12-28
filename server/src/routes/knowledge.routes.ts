// server/routes/knowledge.routes.ts
import express from 'express';
import { createGlossary, addGlossaryEntry } from '../controllers/glossary.controller';

export const knowledgeRoutes = express.Router();

knowledgeRoutes.post('/', createGlossary);
knowledgeRoutes.post('/entry', addGlossaryEntry);
knowledgeRoutes.post('/upload', upload.single('file'), processKnowledgeFile);
