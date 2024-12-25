import { Application } from 'oak';
import { oakCors } from 'oakCors';
import routers from "./src/main/routes.js";
const app = new Application();
const env = Deno.env ;

// Enable CORS for all routes
app.use(oakCors());
app.use('api/auth',routers.routes());
app.use(routers.allowedMethods());
/* Use the routers
app.use(userRouter.routes());   
app.use(userRouter.allowedMethods());
app.use(fileRouter.routes());
app.use(fileRouter.allowedMethods());
app.use(symptomRouter.routes());
app.use(symptomRouter.allowedMethods()); */


console.log(`Server is running on http://localhost:${env.get('PORT')}/`);
await app.listen({ port: parseInt(env.get('PORT')) });
