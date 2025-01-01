  import { UserTable, FileTable, SymptomTable } from './schema.js';
  import client from "./conn.js";
//create user 
export async function createUser(user) { 
   const query = ` INSERT INTO users (email, userName, password) VALUES ($1, $2, $3) RETURNING *; `; 
   const values = [user.email, user.userName, user.password]; 
   try {
     const res = await client.queryObject({text:query,args:values});
      return res.rows[0]; 
    } catch (error) {
       throw new Error(error); 
      } }

//get all users 
export async function getAllUsers() {
  const query = `
    SELECT * FROM users;
  `;

  try {
    const res = await client.queryObject({text:query});
    return res.rows;
  } catch (error) {
    throw new Error("DatabaseConnectionError");
  }
}

//check username exists 
export async function checkUserName( userName ) {
  try{
  if (!userName || userName.length <= 1) {
     throw new Error("ValidationError: userName must be more than one character");
  }
  const query = ` SELECT 1 FROM users WHERE userName = $1;`;
  const values = [userName];
  console.log(values);
  
    const res = await client.queryObject({text:query,args:values});
    const rowCount = res.rows.length;
    return rowCount > 0;
  } catch (error) {
    const err =  new Error("DatabaseConnectionError"+error);
    err.status = 500;
    throw err;
  }
}


//get user by user id 
export async function getUserById(userId ) {
  const query = `
    SELECT * FROM users
    WHERE userId = $1;
  `;
  const values = [userId];

  try {
    const res = await client.queryObject({text:query,args:values});
    return res.rows[0];
  } catch (error) {
    throw new Error("DatabaseConnectionError");
  }
}

export async function updateUser(userId, updates) {
  try {
  if (!userId) {
    throw new Error("InvalidUserId");
  }

  // Get current user data first
  const getCurrentUser = `SELECT * FROM users WHERE userId = $1;`;
  const value = [userId];
  //update user 
 
    const currentUser = await client.queryObject({
      text: getCurrentUser,
      args: value
    });

    if (!currentUser.rows[0]) {
      throw new Error("UserNotFound");
    }
    // Merge current data with updates
    const current = currentUser.rows[0];
    const updatedData = {
      email: updates.email ?? current.email,
      userName: updates.userName ?? current.username,
      password: updates.password ?? current.password,
      googleId: updates.googleId ?? current.googleId,
      userIdOnBlockchain: updates.userIdOnBlockchain ?? current.userIdOnBlockchain,
      referenceLocation: updates.referenceLocation ?? current.referenceLocation,
      dataSharable: updates.dataSharable ?? current.dataSharable
    };
    const query = `
      UPDATE users
      SET email = $1, 
          userName = $2, 
          password = $3, 
          googleId = $4, 
          userIdOnBlockchain = $5, 
          referenceLocation = $6, 
          dataSharable = $7,
          updatedAt = CURRENT_TIMESTAMP
      WHERE userId = $8
      RETURNING *;
    `;

    const values = [
      updatedData.email,
      updatedData.userName,
      updatedData.password,
      updatedData.googleId,
      updatedData.userIdOnBlockchain,
      updatedData.referenceLocation,
      updatedData.dataSharable,
      userId
    ];

    const res = await client.queryObject({
      text: query,
      args: values
    });
    
    return res.rows[0];
  }catch (error) {
    console.error('Database error:', error);
    throw new Error(error.message || "DatabaseConnectionError");
  }
}


//delete user 
export async function deleteUser( userId ) {
  const query = `
    DELETE FROM users
    WHERE userId = $1
    RETURNING *;
  `;
  const values = [userId];

  try {
    const res = await client.queryObject({text:query,args:values});
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
    const res = await client.queryObject({text:query,args:values});
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