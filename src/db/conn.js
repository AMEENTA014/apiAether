import { Client } from "pg";
import { drizzle } from "drizzle-orm/postgres-js";
import { defineConfig } from "./dbConfig.js";
import { UserTable} from "./schema.js";
console.log(defineConfig);
console.log("hi");
let connection;
try {
  const client = new Client(defineConfig);

  await client.connect();
  console.log('Database connected successfully');
  await client.queryArray('SELECT NOW()'); console.log('Simple query executed successfully');
  connection = drizzle(client);
  console.log("Drizzle ORM initialized");
  console.log(connection);
  // Perform a test query to ensure the connection is working
  const testResult = await connection.select().from(UserTable).execute();
  console.log("Test query result:", testResult);
} catch (error) {
  console.error("Error connecting to the database:", error);
  throw error;  // Optionally rethrow the error if you want to propagate it
}
export { connection };
