import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Função para gerenciar a conexão com o banco de dados
export const connectDatabase = async () => {
  try {
    await prisma.$connect();
    console.log('Conectado ao banco de dados com sucesso!');
  } catch (error) {
    console.error('Erro ao conectar ao banco de dados:', error);
    throw error; // Lança o erro para que ele possa ser tratado no arquivo `index.ts`
  }
};

// Exporta o cliente Prisma como padrão para uso em outras partes do app
export default prisma;
