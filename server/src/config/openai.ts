import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

if (!configuration.apiKey) {
    throw new Error("Chave da OpenAI não encontrada. Verifique o arquivo .env.");
}
// New (i.e., OpenAI NodeJS SDK v4)

const openai = new OpenAIApi(configuration);

export default openai;






