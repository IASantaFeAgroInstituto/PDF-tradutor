import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { configureSecurityMiddleware } from './config/security';
import { authRoutes } from './routes/auth.routes';
import { translationRoutes } from './routes/translation.routes';
import { knowledgeRoutes } from './routes/knowledge.routes';
import { authMiddleware } from './middlewares/auth';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';
import { Server } from "socket.io";

// Carregar variáveis de ambiente
dotenv.config();

// Inicializar o app Express
const app = express();

// Configurações do CORS
const allowedOrigins = ['http://localhost:3000', 'http://localhost:5000'];
app.use(cors({ origin: allowedOrigins, methods: ['GET', 'POST'] }));

// Middleware de segurança
configureSecurityMiddleware(app);

// Middleware de parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas públicas
app.use('/api/auth', authRoutes);

// Rotas protegidas
app.use('/api/translations', authMiddleware, translationRoutes);
app.use('/api/knowledge-bases', authMiddleware, knowledgeRoutes);

// Middleware de arquivos estáticos
app.use('/downloads', express.static('uploads'));

// Manipuladores de erros
app.use(errorHandler);
app.use(notFoundHandler);

// Criar servidor HTTP e integrar com Socket.IO
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
  },
});

// Configuração do WebSocket
io.on('connection', (socket) => {
  console.log('Novo cliente conectado:', socket.id);

  // Receber e transmitir atualizações em tempo real
  socket.on('translation-progress', (data) => {
    console.log('Atualização recebida:', data);
    io.emit('progress-update', data);
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

// Iniciar o servidor
const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

export { io };
