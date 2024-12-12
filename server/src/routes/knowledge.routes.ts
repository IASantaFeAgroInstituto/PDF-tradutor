import { Router } from 'express';
import * as knowledgeController from '../controllers/knowledge.controller';

const router = Router();

router.post('/', knowledgeController.createKnowledgeBase);
router.get('/', knowledgeController.getKnowledgeBases);
router.post('/:id/entries', knowledgeController.addEntry);

export default router;