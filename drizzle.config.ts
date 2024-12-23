import { defineConfig } from 'drizzle-kit';
import {config} from 'dotenv'; 
const env = config();
export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    host: env.DB_HOST,
    port: Number(env.DB_PORT),
    user: env.DB_USER,   password: env.DB_PASSWORD,
    database: env.DB_NAME,
  },
});
