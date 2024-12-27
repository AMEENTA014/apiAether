  import { UserTable, FileTable, SymptomTable } from './schema.js';
  import { connection } from "./conn.js";

export async function createUser(userData) {
    return await connection.insert(UserTable).values(userData).execute();
  }

export async function getUsers() {
  return await connection.select().from(UserTable).execute();
}

export async function checkUserName(userName){
return await connection.select().from(UserTable).where({userName}).execute();
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

// Create a new file record
export async function createFile(fileData) {
  try {
    return await connection.insert(FileTable).values(fileData).execute();
  } catch (error) {
    throw new Error('DatabaseConnectionError');
  }
}

// Get all file records
export async function getFiles() {
  try {
    return await connection.select().from(FileTable).execute();
  } catch (error) {
    throw new Error('DatabaseConnectionError');
  }
}

// Get a file record by its ID
export async function getFileById(fileId) {
  try {
    return await connection.select().from(FileTable).where({ fileId }).execute();
  } catch (error) {
    throw new Error('DatabaseConnectionError');
  }
}

// Update a file record by its ID
export async function updateFile(fileId, updateData) {
  try {
    return await connection.update(FileTable).set(updateData).where({ fileId }).execute();
  } catch (error) {
    throw new Error('DatabaseConnectionError');
  }
}

// Delete a file record by its ID
export async function deleteFile(fileId) {
  try {
    return await connection.delete().from(FileTable).where({ fileId }).execute();
  } catch (error) {
    throw new Error('DatabaseConnectionError');
  }
}

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