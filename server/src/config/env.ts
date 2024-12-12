import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('3000'),
  JWT_SECRET: z.string(),
  DATABASE_URL: z.string(),
  UPLOAD_DIR: z.string().default('./uploads'),
});

const env = envSchema.parse(process.env);

export default env;