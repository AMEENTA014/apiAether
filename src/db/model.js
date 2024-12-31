  import { UserTable, FileTable, SymptomTable } from './schema.js';
  import client from "./conn.js";
//create user 
export async function createUser(user) { 
  const { email, userName, password } = user;
   const query = ` INSERT INTO users (email, userName, password) VALUES ($1, $2, $3) RETURNING *; `; 
   const values = [email, userName, password]; 
   try {
     const res = await client.queryObject(query, ...values);
      return res.rows[0]; 
    } catch (error) {
       throw new Error("DatabaseConnectionError"); 
      
      } }

//get all users 
export async function getAllUsers() {
  const query = `
    SELECT * FROM users;
  `;

  try {
    const res = await client.queryObject(query);
    return res.rows;
  } catch (error) {
    throw new Error("DatabaseConnectionError");
  }
}

//check username exists 
export async function checkUserName( userName ) {
  const query = `
    SELECT 1 FROM users
    WHERE userName = $1;
  `;
  const values = [userName];
  try {
    const res = await client.queryObject(query, ...values);
    const rowCount = res.rows.length;
    return rowCount > 0;
  } catch (error) {
    throw new Error("DatabaseConnectionError");
  }
}


//get user by user id 
export async function getUserById({ userId }) {
  const query = `
    SELECT * FROM users
    WHERE userId = $1;
  `;
  const values = [userId];

  try {
    const res = await client.queryObject(query, ...values);
    return res.rows[0];
  } catch (error) {
    throw new Error("DatabaseConnectionError");
  }
}

//update user 
export async function updateUser(user) {
  const { userId, email, userName, password, googleId, userIdOnBlockchain, referenceLocation, dataSharable } = user;
  const query = `
    UPDATE users
    SET email = $1, userName = $2, password = $3, googleId = $4, userIdOnBlockchain = $5, referenceLocation = $6, dataSharable = $7, updatedAt = CURRENT_TIMESTAMP
    WHERE userId = $8
    RETURNING *;
  `;
  const values = [email, userName, password, googleId, userIdOnBlockchain, referenceLocation, dataSharable, userId];

  try {
    const res = await client.queryObject(query, ...values);
    return res.rows[0];
  } catch (error) {
    throw new Error("DatabaseConnectionError");
  }
}


//delete user 
export async function deleteUser({ userId }) {
  const query = `
    DELETE FROM users
    WHERE userId = $1
    RETURNING *;
  `;
  const values = [userId];

  try {
    const res = await client.queryObject(query, ...values);
    return res.rows[0];
  } catch (error) {
    throw new Error("DatabaseConnectionError");
  }
}

//get user by email
export async function getUserByEmail( email ) {
  const query = `
    SELECT * FROM users
    WHERE email = $1;
  `;
  const values = [email];

  try {
    const res = await client.queryObject(query, ...values);
    return res.rows[0];
  } catch (error) {
    throw new Error("DatabaseConnectionError");
  }
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
//getfile by userid
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