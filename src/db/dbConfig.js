import {load} from "dotenv";
const env = await load({ export: true,});
export const defineConfig = {
     user: env.DB_USER, 
     password: env.DB_PASSWORD,
     hostname: env.DB_HOST, 
     port: Number(env.DB_PORT),
     database: env.DB_NAME,
}