import { Application, Router } from 'oak';
import { config } from 'dotenv';
import { oakCors } from 'oakCors';
import { createUser, getUsers, getUserById, updateUser, deleteUser } from './src/db/index.js';
import { createFile, getFiles, getFileById, updateFile, deleteFile } from './src/db/index.js';
import { createSymptom, getSymptoms, getSymptomById, updateSymptom, deleteSymptom } from './src/db/index.js';

const env = config();
const app = new Application();
const userRouter = new Router();
const fileRouter = new Router();
const symptomRouter = new Router();

// Enable CORS for all routes
app.use(oakCors());

// User Routes
userRouter
  .get('/users', async (context) => {
    const users = await getUsers();
    context.response.body = users;
  })
  .get('/users/:id', async (context) => {
    const id = parseInt(context.params.id);
    const user = await getUserById(id);
    context.response.body = user;
  })
  .post('/users', async (context) => {
    const body = await context.request.body().value;
    const newUser = await createUser(body);
    context.response.body = newUser;
  })
  .put('/users/:id', async (context) => {
    const id = parseInt(context.params.id);
    const body = await context.request.body().value;
    const updatedUser = await updateUser(id, body);
    context.response.body = updatedUser;
  })
  .delete('/users/:id', async (context) => {
    const id = parseInt(context.params.id);
    await deleteUser(id);
    context.response.body = { message: 'User deleted successfully' };
  })
  .put()

// File Routes
fileRouter
  .get('/files', async (context) => {
    const files = await getFiles();
    context.response.body = files;
  })
  .get('/files/:id', async (context) => {
    const id = parseInt(context.params.id);
    const file = await getFileById(id);
    context.response.body = file;
  })
  .post('/files', async (context) => {
    const body = await context.request.body().value;
    const newFile = await createFile(body);
    context.response.body = newFile;
  })
  .put('/files/:id', async (context) => {
    const id = parseInt(context.params.id);
    const body = await context.request.body().value;
    const updatedFile = await updateFile(id, body);
    context.response.body = updatedFile;
  })
  .delete('/files/:id', async (context) => {
    const id = parseInt(context.params.id);
    await deleteFile(id);
    context.response.body = { message: 'File deleted successfully' };
  });

// Symptom Routes
symptomRouter
  .get('/symptoms', async (context) => {
    const symptoms = await getSymptoms();
    context.response.body = symptoms;
  })
  .get('/symptoms/:id', async (context) => {
    const id = parseInt(context.params.id);
    const symptom = await getSymptomById(id);
    context.response.body = symptom;
  })
  .post('/symptoms', async (context) => {
    const body = await context.request.body().value;
    const newSymptom = await createSymptom(body);
    context.response.body = newSymptom;
  })
  .put('/symptoms/:id', async (context) => {
    const id = parseInt(context.params.id);
    const body = await context.request.body().value;
    const updatedSymptom = await updateSymptom(id, body);
    context.response.body = updatedSymptom;
  })
  .delete('/symptoms/:id', async (context) => {
    const id = parseInt(context.params.id);
    await deleteSymptom(id);
    context.response.body = { message: 'Symptom deleted successfully' };
  });

// Use the routers
app.use(userRouter.routes());
app.use(userRouter.allowedMethods());
app.use(fileRouter.routes());
app.use(fileRouter.allowedMethods());
app.use(symptomRouter.routes());
app.use(symptomRouter.allowedMethods());

console.log(`Server is running on http://localhost:${env.PORT}/`);
await app.listen(env.PORT);
