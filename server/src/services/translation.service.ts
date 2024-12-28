import prisma from '../config/database';
import openai from '../config/openai';
import { io } from '../index'; // Importando o servidor WebSocket


export async function updateTranslationProgress(translationId: string): Promise<void> {
  try {
    await prisma.translation.update({
      where: { id: translationId },
      data: { status: "processing" },
    });

    // Simula um processo de tradução
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Atualiza para "completo"
    await prisma.translation.update({
      where: { id: translationId },
      data: { status: "completed" },
    });
  } catch (error) {
    console.error("Erro ao atualizar o progresso da tradução:", error);
  }
}



export const translateFileWithOpenAI = async (filePath: string, targetLanguage: string): Promise<string> => {
  try {
    // Simula leitura de arquivo - substitua pelo parser real
    const fileContent = 'Este é um exemplo de conteúdo para tradução.';

    // Realizar tradução com OpenAI
    const response = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: `Traduza o seguinte texto para ${targetLanguage}: ${fileContent}`,
      max_tokens: 1000,
    });

    const translatedContent = response.data.choices[0].text?.trim() || '';

    // Atualizar progresso no frontend
    io.emit('translation-progress', { progress: 100 });

    return translatedContent;
  } catch (error) {
    console.error('Erro durante a tradução:', error);
    throw new Error('Falha ao traduzir o arquivo.');
  }
};
