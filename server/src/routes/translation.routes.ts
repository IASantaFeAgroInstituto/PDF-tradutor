// server/routes/translation.routes.ts
import express from 'express';
import multer from 'multer';
import { translateDocument } from '../controllers/translation.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { updateTranslationProgress } from "../services/translation.service";
import path from 'path';



const upload = multer({ dest: process.env.UPLOAD_DIR || './uploads' });
export const translationRoutes = express.Router();

translationRoutes.post('/', upload.single('file'), translateDocument);
translationRoutes.patch('/:id/progress', authenticate, updateTranslationProgress);

translationRoutes.get('/download/:fileName', (req, res) => {
    const fileName = req.params.fileName;
    const filePath = path.join(__dirname, '../../translated_pdfs', fileName);
    res.download(filePath, fileName);
  });