  import client from "./conn.js";
  /*import middleWare from "../main/middleWare.js";
  const generateRandomPassword = () => {
    const length = 16;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    return password;
  };*/
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
      /*export async function createUser(user) {
        const query = `
          INSERT INTO users (
            email, 
            userName, 
            password,
            googleId
          ) 
          VALUES ($1, $2, $3, $4) 
          RETURNING *;
        `;
        
        // If googleId is provided, generate a random password
        // If password is provided, use it directly
        const password = user.googleId ? 
          await middleWare.hashPass(generateRandomPassword()) : 
          user.password;
      
        const values = [
          user.email,
          user.userName,
          password,    // password is never null
          user.googleId || null
        ];
      
        try {
          const res = await client.queryObject({
            text: query,
            args: values
          });
          return res.rows[0];
        } catch (error) {
          console.error('Create user error:', error);
          throw new Error(error.message || "DatabaseError");
        }
      }*/

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

// File Operations
export async function createFile(file) {
  const query = `
    INSERT INTO files (userId, expirationTime, url, fileuuid)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
  file.fileuuid = file.fileuuid===undefined?null:file.fileuuid;
  console.log(file);
  const values = [file.userId, file.expirationTime, file.url, file.fileuuid];
  
  try {
    const res = await client.queryObject({text: query, args: values});
    return res.rows[0];
  } catch (error) {
    throw new Error(error);
  }
}

export async function getFileById(fileId) {
  const query = `
    SELECT * FROM files
    WHERE fileId = $1;
  `;
  const values = [fileId];

  try {
    const res = await client.queryObject({text: query, args: values});
    return res.rows[0];
  } catch (error) {
    throw new Error(error);
  }
}
export async function getAllFiles() {
  const query = `
    SELECT * FROM files;
  `;

  try {
    const res = await client.queryObject({ text: query });
    return res.rows;
  } catch (error) {
    throw new Error("DatabaseConnectionError");
  }
}

export async function getFileByUuid(fileuuid) {
  const query = `
    SELECT * FROM files
    WHERE fileuuid = $1;
  `;
  const values = [fileuuid];

  try {
    const res = await client.queryObject({text: query, args: values});
    return res.rows[0];
  } catch (error) {
    throw new Error("DatabaseConnectionError");
  }
}

export async function getFilesByUserId(userId) {
  const query = `
    SELECT * FROM files
    WHERE userId = $1;
  `;
  const values = [userId];

  try {
    const res = await client.queryObject({text: query, args: values});
    return res.rows;
  } catch (error) {
    throw new Error("DatabaseConnectionError");
  }
}

export async function updateFile(fileId, updates) {
  try {
    if (!fileId) {
      throw new Error("InvalidFileId");
    }

    // Get current file data first
    const getCurrentFile = `SELECT * FROM files WHERE fileId = $1;`;
    const value = [fileId];
    
    const currentFile = await client.queryObject({
      text: getCurrentFile,
      args: value
    });

    if (!currentFile.rows[0]) {
      throw new Error("FileNotFound");
    }

    // Merge current data with updates
    const current = currentFile.rows[0];
    const updatedData = {
      expirationTime: updates.expirationTime ?? current.expirationtime,
      url: updates.url ?? current.url,
      fileuuid: updates.fileuuid ?? current.fileuuid
    };

    const query = `
      UPDATE files
      SET expirationTime = $1,
          url = $2,
          fileuuid = $3,
          updatedAt = CURRENT_TIMESTAMP
      WHERE fileId = $4
      RETURNING *;
    `;

    const values = [
      updatedData.expirationTime,
      updatedData.url,
      updatedData.fileuuid,
      fileId
    ];

    const res = await client.queryObject({
      text: query,
      args: values
    });
    
    return res.rows[0];
  } catch (error) {
    console.error('Database error:', error);
    throw new Error(error.message || "DatabaseConnectionError");
  }
}

export async function deleteFile(fileId) {
  const query = `
    DELETE FROM files
    WHERE fileId = $1
    RETURNING *;
  `;
  const values = [fileId];

  try {
    const res = await client.queryObject({text: query, args: values});
    return res.rows[0];
  } catch (error) {
    throw new Error("DatabaseConnectionError");
  }
}

// Symptom Operations
export async function createSymptom(symptom) {
  const query = `
    INSERT INTO symptoms (userId, description, result, confidenceRateOfResult)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
  const values = [
    symptom.userId,
    symptom.description,
    symptom.result,
    symptom.confidenceRateOfResult
  ];
  
  try {
    const res = await client.queryObject({text: query, args: values});
    return res.rows[0];
  } catch (error) {
    throw new Error(error);
  }
}

export async function getSymptomById(symptomId) {
  const query = `
    SELECT * FROM symptoms
    WHERE symptomId = $1;
  `;
  const values = [symptomId];

  try {
    const res = await client.queryObject({text: query, args: values});
    return res.rows[0];
  } catch (error) {
    throw new Error("DatabaseConnectionError");
  }
}

export async function getSymptomsByUserId(userId) {
  const query = `
    SELECT * FROM symptoms
    WHERE userId = $1;
  `;
  const values = [userId];

  try {
    const res = await client.queryObject({text: query, args: values});
    return res.rows;
  } catch (error) {
    throw new Error("DatabaseConnectionError");
  }
}

export async function updateSymptom(symptomId, updates) {
  try {
    if (!symptomId) {
      throw new Error("InvalidSymptomId");
    }

    // Get current symptom data first
    const getCurrentSymptom = `SELECT * FROM symptoms WHERE symptomId = $1;`;
    const value = [symptomId];
    
    const currentSymptom = await client.queryObject({
      text: getCurrentSymptom,
      args: value
    });

    if (!currentSymptom.rows[0]) {
      throw new Error("SymptomNotFound");
    }

    // Merge current data with updates
    const current = currentSymptom.rows[0];
    const updatedData = {
      description: updates.description ?? current.description,
      result: updates.result ?? current.result,
      confidenceRateOfResult: updates.confidenceRateOfResult ?? current.confidencerateofresult
    };

    const query = `
      UPDATE symptoms
      SET description = $1,
          result = $2,
          confidenceRateOfResult = $3
      WHERE symptomId = $4
      RETURNING *;
    `;

    const values = [
      updatedData.description,
      updatedData.result,
      updatedData.confidenceRateOfResult,
      symptomId
    ];

    const res = await client.queryObject({
      text: query,
      args: values
    });
    
    return res.rows[0];
  } catch (error) {
    console.error('Database error:', error);
    throw new Error(error.message || "DatabaseConnectionError");
  }
}

export async function deleteSymptom(symptomId) {
  const query = `
    DELETE FROM symptoms
    WHERE symptomId = $1
    RETURNING *;
  `;
  const values = [symptomId];

  try {
    const res = await client.queryObject({text: query, args: values});
    return res.rows[0];
  } catch (error) {
    throw new Error("DatabaseConnectionError");
  }
}

export async function getAllSymptoms() {
  const query = `
    SELECT * FROM symptoms
    ORDER BY createdAt DESC;
  `;

  try {
    const res = await client.queryObject({text: query});
    return res.rows;
  } catch (error) {
    throw new Error("DatabaseConnectionError");
  }
}

// Controller
