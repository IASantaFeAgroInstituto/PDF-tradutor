import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import env from '../config/env';
import * as translationController from '../controllers/translation.controller';

const storage = multer.diskStorage({
  destination: env.UPLOAD_DIR,
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });

const router = Router();

router.post('/', upload.single('file'), translationController.createTranslation);
router.get('/', translationController.getTranslations);
router.get('/:id', translationController.getTranslation);

export default router;