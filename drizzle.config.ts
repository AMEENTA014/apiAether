/*import type { Config } from "drizzle-kit";
import {load} from "dotenv";
const env = load({ path: '../../.env'});
const config: Config = { dialect: "postgresql",
   schema: "./src/schema.js",
    out: "./migrations", 
  dbCredentials: { url: `postgres://${env.get('DB_USER')}:${env.get('DB_PASSWORD')}@${env.get('DB_HOST')}:${env.get('DB_PORT')}/${env.get('DB_NAME')}`, },
 verbose: true, 
 strict: true, }; 
 export default config ;*/