import client from "./src/db/conn.js";
import { Application } from 'oak';
import { oakCors } from 'oakCors';
import {authRouter} from "./src/main/routes.js";
import { config } from "dotenv";
config({path:"./.env"});
const app = new Application();
// Enable CORS for all routes
app.use(oakCors());

app.use(authRouter.routes());
app.use(authRouter.allowedMethods());

console.log(`Server is running on http://localhost:${Deno.env.get('PORT')}/`);
await app.listen({ port: parseInt(Deno.env.get('PORT')) });
/* Use the routers
app.use(userRouter.routes());   
app.use(userRouter.allowedMethods());
app.use(fileRouter.routes());
app.use(fileRouter.allowedMethods());
app.use(symptomRouter.routes());
app.use(symptomRouter.allowedMethods()); */