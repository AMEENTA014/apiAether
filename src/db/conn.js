import { Client } from "dpg";
import { config } from "dotenv";
config({ path: "../../.env" });
const defineConfig = {
  user:Deno.env.get('DB_USER'),
  password: Deno.env.get('DB_PASSWORD'),
  hostname: Deno.env.get('DB_HOST'), 
  port: Number(Deno.env.get('DB_PORT')),
  database: Deno.env.get('DB_NAME'),
}
 

const client = new Client(defineConfig);
await client.connect();
async function createUser(user) { 
    const { email, userName, password } = user;
     const query = ` INSERT INTO users (email, userName, password) VALUES ($1, $2, $3) RETURNING *; `; 
     const values = [email, userName, password]; 
     try {
       const res = await client.queryObject(query, ...values);
        return res.rows[0]; 
      } catch (err) {
         throw new Error(err); 
        
        } }      
export default client;