import express from 'express';
import cors from 'cors';
import env from './config/env';
import { authMiddleware } from './middlewares/auth';
import { errorHandler } from './middlewares/error';
import authRoutes from './routes/auth.routes';
import translationRoutes from './routes/translation.routes';
import knowledgeRoutes from './routes/knowledge.routes';

const app = express();

app.use(cors());
app.use(express.json());

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/translations', authMiddleware, translationRoutes);
app.use('/api/knowledge-bases', authMiddleware, knowledgeRoutes);

// Serve uploaded files
app.use('/downloads', express.static(env.UPLOAD_DIR));

// Error handling
app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`);
});