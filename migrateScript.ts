
import { Client } from "pg";
import { walk } from "fs";
import { defineConfig } from "./src/db/dbConfig.js";
const client = new Client(defineConfig);


await client.connect();
console.log('Database connected successfully');

for await (const entry of walk("./src/db/migrations/", { exts: [".sql"], includeDirs: false })) {
  const sql = await Deno.readTextFile(entry.path);
  await client.queryArray(sql);
  console.log(`Executed migration: ${entry.name}`);
}

await client.end();
console.log("All migrations applied successfully");
