
import { Client } from "dpg";
import { walk } from "fs";
import { config } from "dotenv";
config({ path: "./.env" });
const defineConfig = {
  user:Deno.env.get('DB_USER'),
  password: Deno.env.get('DB_PASSWORD'),
  hostname: Deno.env.get('DB_HOST'), 
  port: Number(Deno.env.get('DB_PORT')),
  database: Deno.env.get('DB_NAME'),
}
const client = new Client(defineConfig);
await client.connect();
console.log('Database connected successfully');

for await (const entry of walk("./src/db/manualMigrations/", { exts: [".sql"], includeDirs: false })) {
  const sql = await Deno.readTextFile(entry.path);
  await client.queryArray(sql);
  console.log(`Executed migration: ${entry.name}`);
}

await client.end();
console.log("All migrations applied successfully");
