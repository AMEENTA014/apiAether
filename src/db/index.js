import { connect } from 'drizzle-orm';
import { config } from 'dotenv';
import { UserTable, FileTable, SymptomTable } from './schema.js';

// Load environment variables
const env = config();

// Database connection configuration
const connection = connect({
  host: 'localhost',
  port: 5432,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
});

// User Table CRUD Operations

export async function createUser(userData) {
  return await connection.insert(UserTable).values(userData).execute();
}

export async function getUsers() {
  return await connection.select().from(UserTable).execute();
}

export async function getUserById(userId) {
  return await connection.select().from(UserTable).where({ userId }).execute();
}

export async function updateUser(userId, updateData) {
  return await connection.update(UserTable).set(updateData).where({ userId }).execute();
}

export async function deleteUser(userId) {
  return await connection.delete().from(UserTable).where({ userId }).execute();
}

export async function getUserByEmailModel(email) {
  return await connection.select().from(UserTable).where({ email }).execute();
}


// File Table CRUD Operations

export async function createFile(fileData) { return await connection.insert(FileTable).values(fileData).execute(); } export async function getFiles() { return await connection.select().from(FileTable).execute(); } export async function getFileById(fileId) { return await connection.select().from(FileTable).where({ fileId }).execute(); } export async function updateFile(fileId, updateData) { return await connection.update(FileTable).set(updateData).where({ fileId }).execute(); } export async function deleteFile(fileId) { return await connection.delete().from(FileTable).where({ fileId }).execute(); }

// Symptom Table CRUD Operations

export async function createSymptom(symptomData) {
  try {
    return await connection.insert(SymptomTable).values(symptomData).execute();
  } catch (error) {
    throw new Error('DatabaseConnectionError');
  }
}

export async function getSymptoms() {
  try {
    return await connection.select().from(SymptomTable).execute();
  } catch (error) {
    throw new Error('DatabaseConnectionError');
  }
}

export async function getSymptomById(symptomId) {
  try {
    return await connection.select().from(SymptomTable).where({ symptomId }).execute();
  } catch (error) {
    throw new Error('DatabaseConnectionError');
  }
}

export async function updateSymptom(symptomId, updateData) {
  try {
    return await connection.update(SymptomTable).set(updateData).where({ symptomId }).execute();
  } catch (error) {
    throw new Error('DatabaseConnectionError');
  }
}

export async function deleteSymptom(symptomId) {
  try {
    return await connection.delete().from(SymptomTable).where({ symptomId }).execute();
  } catch (error) {
    throw new Error('DatabaseConnectionError');
  }
}


// Export the database connection
export { connection };
