import {getUserByEmail,createUser,checkUserName,getUserById,updateUser,deleteUser,getAllUsers,createFile,deleteFile,updateFile,getFileById,getFileByUuid,getFilesByUserId,createSymptom,deleteSymptom,updateSymptom,getSymptomById,getSymptomsByUserId,getAllFiles,getAllSymptoms} from  "../db/model.js";
import * as middleWares from "./middleWare.js";
/*
import { OTPAuth } from "https://deno.land/x/otpauth/mod.ts";
import { OAuth2Client } from "https://deno.land/x/oauth2_client/mod.ts";*/
import {config} from "dotenv";
 config({path:"../../.env"});
const tempStore = new Map(); // In-memory store for temporary data

export const signUpUserController = async (context) => {
  const fetchRequest = context.request.source;
  const rawBody = await fetchRequest.text();
  if (!rawBody) { throw new Error('Empty request body'); }
  const requestBody = JSON.parse(rawBody);
  const { email, username, password } = requestBody;
  if (!email || !username || !password) {
    throw new Error('ValidationError');
  }
  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    const err = new Error('ValidationError'+"userAlreadyExists");
    err.status = 400 ;
    throw err ;
  }
 if(await checkUserName(username)){
  const err = new Error('username already exists');
   err.status = 400 ;
   throw err ;
 }
  const { otp, secret } = middleWares.generateOtp();
  const id =  middleWares.generateUniqueId();
  tempStore.set(id, {
    otp, email, secret, pass: await middleWares.hashPass(password), username, action: 'signUp'
  });
  setTimeout(() => tempStore.delete(id), 600000); // Set expiration to 10 minutes
  const message = `Your OTP is ${otp}. Click this link for signup verification: ${Deno.env.get('VERIFYLINK')}?id=${id}`;
  await middleWares.sendEMail(email, 'signupVerify', message);
  context.response.status = 200;
  context.response.body = { message: 'OTP sent to email' };
};

//verify signup
//import * as middleWares from './middlewares/index.js';

export const verifyController = async (context) => {
  const fetchRequest = context.request.source;
  const rawBody = await fetchRequest.text();
  if (!rawBody) { throw new Error('Empty request body'); }
  const requestBody = JSON.parse(rawBody);;
  const { otp, id } = requestBody;
  if (!id || !otp) {
    const err = new Error('ValidationError: Id or OTP not provided');
    err.status = 400;
    throw err;
  }
  if (!tempStore.has(id)) {
    const err = new Error('ValidationError: OTP expired or invalid');
    err.status = 400;
    throw err;
  }
  const data = tempStore.get(id);
  if (!middleWares.verifyOtp(data.secret, otp)) {
    const err = new Error('ValidationError: Invalid OTP');
    err.status = 400;
    throw err;
  }

  if (data.action === 'signUp') {
    const userData = {
      email: data.email,
      userName: data.username,
      password: data.pass,
    };
    const createdData = await createUser(userData);
    userData.userId = createdData.userid;
    tempStore.delete(id);
    context.response.status = 200;
    context.cookies.set('token', await middleWares.createToken(userData), { httpOnly: true });
    context.response.body = {
      message: 'LoginSuccess',
      userId: createdData.userid
    };
  }
};


//signin 
/*const oAuth2Client = new OAuth2Client({
  clientId: Deno.env.get('GOOGLE_CLIENT_ID'),
  clientSecret: Deno.env.get('GOOGLE_CLIENT_SECRET'),
  redirectUri: Deno.env.get('GOOGLE_REDIRECT_URI'),
});

export const googleSignInController = async (context) => {
  try {
    const fetchRequest = context.request.source;
    const rawBody = await fetchRequest.text();
    
    if (!rawBody) {
      throw new Error('Empty request body');
    }
    
    const requestBody = JSON.parse(rawBody);
    const { idToken } = requestBody;

    if (!idToken) {
      const err = new Error('ValidationError: ID token is required');
      err.status = 400;
      throw err;
    }

    // Verify the ID token
    let ticket;
    try {
      ticket = await oAuth2Client.verifyIdToken({
        idToken,
        audience: Deno.env.get('GOOGLE_CLIENT_ID'),
      });
    } catch (error) {
      const err = new Error('Invalid ID token');
      err.status = 401;
      throw err;
    }

    const payload = ticket.getPayload();
    const { email, name, sub: googleId } = payload;

    if (!email || !name || !googleId) {
      const err = new Error('Invalid Google account information');
      err.status = 400;
      throw err;
    }

    // Check if user exists
    let user = await getUserByEmail(email);

    if (!user) {
      // Generate unique username from Google name
      const baseUsername = name.toLowerCase().replace(/[^a-z0-9]/g, '');
      let username = baseUsername;
      let counter = 1;
      
      while (await checkUserName(username)) {
        username = `${baseUsername}${counter}`;
        counter++;
      }

      // Create new user with Google ID and a random password
      user = await createUser({
        email,
        userName: username,
        googleId
      });

      // Send welcome email with password reset instructions
      const resetLink = `${Deno.env.get('RESETLINK')}?email=${encodeURIComponent(email)}`;
      await middleWares.sendEMail(
        email,
        'Welcome to Platform - Set Your Password',
        `Welcome to our platform! Your account has been created using Google Sign-In. 
        For added security, please set your password by clicking this link: ${resetLink}`
      );
    } else {
      // For existing users, verify Google ID
      if (user.googleId && user.googleId !== googleId) {
        const err = new Error('Account exists with different credentials');
        err.status = 409;
        throw err;
      }

      // If user exists but doesn't have googleId, update it
      if (!user.googleId) {
        user = await updateUser(user.userId, {
          googleId: googleId
        });
      }
    }

    // Create authentication token
    const token = await middleWares.createToken(user);

    // Set response
    context.response.status = 200;
    context.response.cookies.set('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 // 1 hour, matching your JWT expiration
    });

    context.response.body = {
      status: 'success',
      message: user.isNewUser ? 'Account created successfully' : 'Login successful',
      userId: user.userId,
      email: user.email,
      username: user.userName
    };

  } catch (error) {
    const status = error.status || 500;
    context.response.status = status;
    context.response.body = {
      status: 'error',
      message: error.message || 'Internal server error'
    };
    
    console.error('[GoogleSignIn Error]:', {
      status,
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
};
*/

//login 

export const loginUserController = async (context) => {
  const fetchRequest = context.request.source;
  const rawBody = await fetchRequest.text();
  if (!rawBody) { throw new Error('Empty request body'); }
  const requestBody = JSON.parse(rawBody);
  const { email, password } = requestBody;

  if (!email || !password) {
    const err = new Error('ValidationError: Both email and password are required');
    err.status = 400;
    throw err;
  }

  const user = await getUserByEmail(email);

  if (!user) {
    const err = new Error('ValidationError: User does not exist');
    err.status = 400;
    throw err;
  }

  const validPassword = await middleWares.validatePassword(password, user.password);

  if (!validPassword) {
    const err = new Error('ValidationError: Invalid password');
    err.status = 400;
    throw err;
  }

  context.response.status = 200;
  context.cookies.set('token', await middleWares.createToken({email:user.email,userName:user.username,password:user.password,userId:user.userid}), { httpOnly: true });
  context.response.body = {
    message: 'LoginSuccess',
    userId: user.userid
  };
};

//logout 
export const logoutUserController =  (context) => {
    context.cookies.delete('token');
    context.response.status = 200;
    context.response.body = 'LogoutSuccess';
  };
  // forgot password 
  export const forgotPasswordController = async (context) => {
    const fetchRequest = context.request.source;
    const rawBody = await fetchRequest.text();
  if (!rawBody) { throw new Error('Empty request body'); }
  const requestBody = JSON.parse(rawBody);
    const { email } = requestBody;
  
    if (!email) {
      const err = new Error("EmailRequired");
      err.status = 400;
      throw err;
    }
  
    try {
      const user = await getUserByEmail(email);
      if (!user) {
        const err = new Error("User doesn't exist");
        err.status = 400;
        throw err;
      }
  
      const resetId = middleWares.generateUniqueId();
      tempStore.set(resetId, JSON.stringify({ email: email, userId: user.userid }));
      setTimeout(() => tempStore.delete(resetId), 600 * 1000);
      const resetLink = `${Deno.env.get('RESETLINK')}/${resetId}`;
      await middleWares.sendEMail(email, 'resetPass', `Click this link to reset your password: ${resetLink}`);
      context.response.status = 200;
      context.response.body = { message: "ResetLinkSent" };
    } catch (err) {
      throw err;
    }
  };
  
          //reset password 
          export const resetPasswordController = async (context) => {
            const fetchRequest = context.request.source;
            const rawBody = await fetchRequest.text();
            if (!rawBody) { throw new Error('Empty request body'); }
            const requestBody = JSON.parse(rawBody);
            const { email } = requestBody;
          
            if (!email) {
              throw new Error("Email required");
            }
            
            const {userId} = context.state.roleData;
            const user = await getUserById(userId);
            if (user.email !== email) {
              const err = new Error("forbidden");
              err.status = 403
              throw err;
            }
            const resetId = middleWares.generateUniqueId();
            tempStore.set(resetId, JSON.stringify({ userId:userId }));
            setTimeout(() => tempStore.delete(resetId), 600000);
          
            const resetLink = `${Deno.env.get('RESETLINK')}/id=${resetId}`;
            const message = `Click this link to reset your password: ${resetLink}`;
            await middleWares.sendEMail(email, 'resetPass', message);
            context.response.status = 200;
            context.response.body = { success: true };
          };
          
//reset pass verify 
export const verifyResetPasswordController = async (context) => {
  const fetchRequest = context.request.source;
  const rawBody = await fetchRequest.text();
  if (!rawBody) { throw new Error('Empty request body'); }
  const requestBody = JSON.parse(rawBody);
  const { resetId, newPassword } = requestBody;

  if (!resetId || !newPassword) {
    throw new Error("Reset ID and new password are required");
  }
  const data = JSON.parse(tempStore.get(resetId) || "{}");
  if (!data.userId) {
    throw new Error("Reset link expired");
  }

  const updatedUser = await updateUser(data.userId, {
    password: await middleWares.hashPass(newPassword)
  });

  context.response.status = 200;
  context.response.body = updatedUser;
};


export const updateUserController = async (context) => {
  const fetchRequest = context.request.source;
  const rawBody = await fetchRequest.text();
  if (!rawBody) { throw new Error('Empty request body'); }
  const requestBody = JSON.parse(rawBody);
  const {  newUserData } = requestBody;

  if ( !newUserData) {
    const err = new Error('ValidationError: No  New Data Provided');
    err.status = 400;
    throw err;
  }

  try {
    const {userId} = context.state.roleData;
    // Check if user exists
    const userExists = await getUserById(userId);
    if (!userExists) {
      const err = new Error('UserNotFound');
      err.status = 404;
      throw err;
    }
    if (newUserData.email) { 
      const existingUserByEmail = await getUserByEmail(newUserData.email); 
      if (existingUserByEmail && existingUserByEmail.userId !== userId) {
         const err = new Error('ValidationError: Email already in use'); 
         err.status = 400; throw err;
         } 
        } // Check if username is unique 
    if (newUserData.userName) { 
      const existingUserByUsername = await checkUserName(newUserData.userName);
       if (existingUserByUsername ) {
         const err = new Error('ValidationError: Username already in use'); 
         err.status = 400; throw err; 
        }
      }
    // Remove password if present in newUserData
    if (newUserData.password) {
      delete newUserData.password;
    }

    // Update user data
    const updated = await updateUser(userId, newUserData);
    context.response.status = 200;
    context.response.body = updated;
  } catch (err) {
    console.error('Error in updateUserController:', err);
    err.status = err.status || 500;
    throw err;
  }
};

export const deleteUserController = async (context) => {
  
  try {
    const {userId} = context.state.roleData;
    if (!userId) {
      const err = new Error('ValidationError: UserId Required');
      err.status = 400;
      throw err;
    }
    // Check if user exists
    const user = await getUserById(userId);
    console.log(user);
    if (!user) {
      const err = new Error('UserNotFound');
      err.status = 404;
      throw err;
    }

    // Delete user
    await deleteUser(userId);
    context.response.status = 200;
    context.response.body = { message: 'UserDeleted' };
  } catch (err) {
    console.error('Error in deleteUserController:', err);
    err.status = err.status || 500;
    throw err;
  }
};



export const getUserData = async (context) => {
  try{
    const {userId} = context.state.roleData;
  if (!userId) {
    const err = new Error('ValidationError: UserId Required');
    err.status = 400;
    throw err;
  }


    const user = await getUserById(userId);
    if (!user) {
      const err = new Error('UserNotFound');
      err.status = 404;
      throw err;
    }

    context.response.status = 200;
    context.response.body = user;
  } catch (err) {
    console.error('Error in getUserData:', err);
    err.status = err.status || 500;
    throw err;
  }
}
export const getAllUserController = async (context) => {
  try {
    const users = await getAllUsers();
    context.response.status = 200;
    context.response.body = users;
  } catch (err) {
    console.error('Error in getAllUserController:', err);
    err.status = err.status || 500;
    throw err;
  }
};
//new controllers // File Controllers
export const createFileController = async (context) => {
  const fetchRequest = context.request.source;
  const rawBody = await fetchRequest.text();
  if (!rawBody) {
    throw new Error('Empty request body');
  }
  const requestBody = JSON.parse(rawBody);
  const { fileData } = requestBody;

  if (!fileData) {
    const err = new Error('ValidationError: No File Data Provided');
    err.status = 400;
    throw err;
  }

  try {
    const { userId } = context.state.roleData;
    
    // Check if user exists and get user data
    const user = await getUserById(userId);
    if (!user) {
      const err = new Error('UserNotFound');
      err.status = 404;
      throw err;
    }

    fileData.userId = userId;
    const createdFile = await createFile(fileData);
    
    context.response.status = 201;
    context.response.body = {
      message: "file created",
      file: {
        ...createdFile,
        user: {
          userName: user.username,
          email: user.email,
          referenceLocation: user.referencelocation
        }
      }
    };
  } catch (err) {
    console.error('Error in createFileController:', err);
    err.status = err.status || 500;
    throw err;
  }
};

//get allfiles 
export const getAllFilesController = async (context) => {
  try {
    // Optionally, check for admin privileges or specific roles
    const Admin = await getUserById(context.state.roleData.userId);
    if (!(Admin.username === Deno.env.get('ADMIN'))) {
      const err = new Error('UnauthorizedAccess: Admin privileges required');
      err.status = 403;
      throw err;
    }

    const files = await getAllFiles();

    // Option to include user information with each file
    const filesWithUserInfo = await Promise.all(
      files.map(async (file) => {
        const user = await getUserById(file.userid);
        return {
          ...file,
          userName: user ? user.username : 'Unknown User'
        };
      })
    );

    context.response.status = 200;
    context.response.body = filesWithUserInfo;
  } catch (err) {
    console.error('Error in getAllFilesController:', err);
    err.status = err.status || 500;
    throw err;
  }
};
//get based on fileid 
export const getFileController = async (context) => {
  try {
    const { fileId } = context.params;
    const { userId } = context.state.roleData;

    if (!fileId) {
      const err = new Error('ValidationError: FileId Required');
      err.status = 400;
      throw err;
    }

    const file = await getFileById(fileId);
    if (!file) {
      const err = new Error('FileNotFound');
      err.status = 404;
      throw err;
    }

    // Ensure user owns the file
    if (file.userid !== userId) {
      const err = new Error('UnauthorizedAccess');
      err.status = 403;
      throw err;
    }

    // Get user information
    const user = await getUserById(userId);
    const responseData = {
      ...file,
      user: user ? {
        userName: user.username,
        email: user.email,
        referenceLocation: user.referencelocation
      } : null
    };

    context.response.status = 200;
    context.response.body = responseData;
  } catch (err) {
    console.error('Error in getFileController:', err);
    err.status = err.status || 500;
    throw err;
  }
};

export const getFileByUuidController = async (context) => {
  try {
    const { fileuuid } = context.params;
    const { userId } = context.state.roleData;

    if (!fileuuid) {
      const err = new Error('ValidationError: FileUUID Required');
      err.status = 400;
      throw err;
    }

    const file = await getFileByUuid(fileuuid);
    if (!file) {
      const err = new Error('FileNotFound');
      err.status = 404;
      throw err;
    }

    // Ensure user owns the file
    if (file.userid !== userId) {
      const err = new Error('UnauthorizedAccess');
      err.status = 403;
      throw err;
    }

    // Get user information
    const user = await getUserById(userId);
    const responseData = {
      ...file,
      user: user ? {
        userName: user.username,
        email: user.email,
        referenceLocation: user.referencelocation
      } : null
    };

    context.response.status = 200;
    context.response.body = responseData;
  } catch (err) {
    console.error('Error in getFileByUuidController:', err);
    err.status = err.status || 500;
    throw err;
  }
};

export const getUserFilesController = async (context) => {
  try {
    const { userId } = context.state.roleData;

    const files = await getFilesByUserId(userId);
    
    // Get user information once since all files belong to same user
    const user = await getUserById(userId);
    const userInfo = user ? {
      userName: user.username,
      email: user.email,
      referenceLocation: user.referencelocation
    } : null;

    // Add user information to each file
    const filesWithUser = files.map(file => ({
      ...file,
      user: userInfo
    }));

    context.response.status = 200;
    context.response.body = filesWithUser;
  } catch (err) {
    console.error('Error in getUserFilesController:', err);
    err.status = err.status || 500;
    throw err;
  }
};

export const updateFileController = async (context) => {
  const fetchRequest = context.request.source;
  const rawBody = await fetchRequest.text();
  if (!rawBody) {
    throw new Error('Empty request body');
  }
  const requestBody = JSON.parse(rawBody);
  const { fileData } = requestBody;

  if (!fileData) {
    const err = new Error('ValidationError: No File Data Provided');
    err.status = 400;
    throw err;
  }

  try {
    const { fileId } = context.params;
    const { userId } = context.state.roleData;

    // Check if file exists
    const existingFile = await getFileById(fileId);
    if (!existingFile) {
      const err = new Error('FileNotFound');
      err.status = 404;
      throw err;
    }

    // Ensure user owns the file
    if (existingFile.userid !== userId) {
      const err = new Error('UnauthorizedAccess');
      err.status = 403;
      throw err;
    }

    const updated = await updateFile(fileId, fileData);
    
    // Get user information
    const user = await getUserById(userId);
    const responseData = {
      ...updated,
      user: user ? {
        userName: user.username,
        email: user.email,
        referenceLocation: user.referencelocation
      } : null
    };

    context.response.status = 200;
    context.response.body = responseData;
  } catch (err) {
    console.error('Error in updateFileController:', err);
    err.status = err.status || 500;
    throw err;
  }
};

export const deleteFileController = async (context) => {
  try {
    const { fileId } = context.params;
    const { userId } = context.state.roleData;

    // Check if file exists
    const file = await getFileById(fileId);
    if (!file) {
      const err = new Error('FileNotFound');
      err.status = 404;
      throw err;
    }

    // Ensure user owns the file
    if (file.userid !== userId) {
      const err = new Error('UnauthorizedAccess');
      err.status = 403;
      throw err;
    }

    await deleteFile(fileId);
    context.response.status = 200;
    context.response.body = { message: 'FileDeleted' };
  } catch (err) {
    console.error('Error in deleteFileController:', err);
    err.status = err.status || 500;
    throw err;
  }
};

// Symptom Controllers
export const createSymptomController = async (context) => {
  const fetchRequest = context.request.source;
  const rawBody = await fetchRequest.text();
  if (!rawBody) {
    throw new Error('Empty request body');
  }
  const requestBody = JSON.parse(rawBody);
  const { symptomData } = requestBody;

  if (!symptomData) {
    const err = new Error('ValidationError: No Symptom Data Provided');
    err.status = 400;
    throw err;
  }

  try {
    const { userId } = context.state.roleData;
    
    // Check if user exists and get user data
    const user = await getUserById(userId);
    if (!user) {
      const err = new Error('UserNotFound');
      err.status = 404;
      throw err;
    }

    symptomData.userId = userId;
    const createdSymptom = await createSymptom(symptomData);
    
    // Include user information in response
    const responseData = {
      ...createdSymptom,
      user: {
        userName: user.username,
        email: user.email,
        referenceLocation: user.referencelocation
      }
    };

    context.response.status = 201;
    context.response.body = responseData;
  } catch (err) {
    console.error('Error in createSymptomController:', err);
    err.status = err.status || 500;
    throw err;
  }
};

export const getSymptomController = async (context) => {
  try {
    const { symptomId } = context.params;
    const { userId } = context.state.roleData;

    if (!symptomId) {
      const err = new Error('ValidationError: SymptomId Required');
      err.status = 400;
      throw err;
    }

    const symptom = await getSymptomById(symptomId);
    if (!symptom) {
      const err = new Error('SymptomNotFound');
      err.status = 404;
      throw err;
    }

    // Ensure user owns the symptom record
    if (symptom.userid !== userId) {
      const err = new Error('UnauthorizedAccess');
      err.status = 403;
      throw err;
    }

    // Get user information
    const user = await getUserById(symptom.userid);
    const responseData = {
      ...symptom,
      user: user ? {
        userName: user.username,
        email: user.email,
        referenceLocation: user.referencelocation
      } : null
    };

    context.response.status = 200;
    context.response.body = responseData;
  } catch (err) {
    console.error('Error in getSymptomController:', err);
    err.status = err.status || 500;
    throw err;
  }
};

export const getUserSymptomsController = async (context) => {
  try {
    const { userId } = context.state.roleData;

    const symptoms = await getSymptomsByUserId(userId);
    
    // Get user information once since all symptoms belong to same user
    const user = await getUserById(userId);
    const userInfo = user ? {
      userName: user.username,
      email: user.email,
      referenceLocation: user.referencelocation
    } : null;

    // Add user information to each symptom
    const symptomsWithUser = symptoms.map(symptom => ({
      ...symptom,
      user: userInfo
    }));

    context.response.status = 200;
    context.response.body = symptomsWithUser;
  } catch (err) {
    console.error('Error in getUserSymptomsController:', err);
    err.status = err.status || 500;
    throw err;
  }
};

export const updateSymptomController = async (context) => {
  const fetchRequest = context.request.source;
  const rawBody = await fetchRequest.text();
  if (!rawBody) {
    throw new Error('Empty request body');
  }
  const requestBody = JSON.parse(rawBody);
  const { symptomData } = requestBody;

  if (!symptomData) {
    const err = new Error('ValidationError: No Symptom Data Provided');
    err.status = 400;
    throw err;
  }

  try {
    const { symptomId } = context.params;
    const { userId } = context.state.roleData;

    // Check if symptom exists
    const existingSymptom = await getSymptomById(symptomId);
    if (!existingSymptom) {
      const err = new Error('SymptomNotFound');
      err.status = 404;
      throw err;
    }

    // Ensure user owns the symptom record
    if (existingSymptom.userid !== userId) {
      const err = new Error('UnauthorizedAccess');
      err.status = 403;
      throw err;
    }

    const updated = await updateSymptom(symptomId, symptomData);
    
    // Get user information
    const user = await getUserById(userId);
    const responseData = {
      ...updated,
      user: user ? {
        userName: user.username,
        email: user.email,
        referenceLocation: user.referencelocation
      } : null
    };

    context.response.status = 200;
    context.response.body = responseData;
  } catch (err) {
    console.error('Error in updateSymptomController:', err);
    err.status = err.status || 500;
    throw err;
  }
};
export const deleteSymptomController = async (context) => {
  try {
    const { symptomId } = context.params;
    const { userId } = context.state.roleData;

    // Check if symptom exists
    const symptom = await getSymptomById(symptomId);
    if (!symptom) {
      const err = new Error('SymptomNotFound');
      err.status = 404;
      throw err;
    }

    // Ensure user owns the symptom record
    if (symptom.userid !== userId) {
      const err = new Error('UnauthorizedAccess');
      err.status = 403;
      throw err;
    }

    await deleteSymptom(symptomId);
    context.response.status = 200;
    context.response.body = { message: 'SymptomDeleted' };
  } catch (err) {
    console.error('Error in deleteSymptomController:', err);
    err.status = err.status || 500;
    throw err;
  }
};
export const getAllSymptomsController = async (context) => {
  try {
    const Admin = await getUserById(context.state.roleData.userId);
    // You might want to check if the user has admin privileges
    if (!(Admin.username===Deno.env.get('ADMIN'))) {
      const err = new Error('UnauthorizedAccess: Admin privileges required');
      err.status = 403;
      throw err;
    }

    const symptoms = await getAllSymptoms();
    
    // Option to include user information with each symptom
    const symptomsWithUserInfo = await Promise.all(
      symptoms.map(async (symptom) => {
        const user = await getUserById(symptom.userid);
        return {
          ...symptom,
          userName: user ? user.username : 'Unknown User'
        };
      })
    );

    context.response.status = 200;
    context.response.body = symptomsWithUserInfo;
  } catch (err) {
    console.error('Error in getAllSymptomsController:', err);
    err.status = err.status || 500;
    throw err;
  }
};

          export default{
            forgotPasswordController,
            loginUserController,
            logoutUserController,
            signUpUserController,
            verifyController,
            verifyResetPasswordController,
            resetPasswordController,
            updateUserController,
            deleteUserController,
            getAllUserController,
            getUserData,
            createFileController,
            deleteFileController,
            updateFileController,
            getFileController,
            getFileByUuidController,
            getUserFilesController,
            createSymptomController,
            deleteSymptomController,
            updateSymptomController,
            getSymptomController,
            getUserSymptomsController,
            getAllSymptomsController,
            getAllFilesController
          }
