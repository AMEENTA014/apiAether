import {getUserByEmail,createUser,checkUserName,getUserById,updateUser,deleteUser,getAllUsers} from  "../db/model.js";
import * as middleWares from "./middleWare.js";
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
    context.response.body = 'SignUpSuccessLoginned';
  }
};


//signin 
/*
const client = new OAuth2Client(Deno.env.get('GOOGLE_CLIENT_ID'));

export const googleSignInController = async (context) => {
  const { idToken } = await context.request.body().value;

  if (!idToken) {
    throw new Error('ValidationError: ID token is required');
  }

  const ticket = await client.verifyIdToken({
    idToken,
    audience: env.get('GOOGLE_CLIENT_ID'),
  });

  const { email, name: username, sub: googleId } = ticket.getPayload();

  let user = await userModels.getUserByEmailModel(email);

  if (!user) {
    user = await userModels.createUser({
      email,
      userName: username,
      googleId,
      userIdOnBlockchain: 'generated-blockchain-id', // Placeholder
      files: [],
      referenceLocation: 'default-location',
      dataSharable: true
    });
  }

  context.response.status = 200;
  context.response.cookies.set('token', await middleWares.createToken(user), { httpOnly: true });
  context.response.body = 'LoginSuccess';
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
  context.response.body = 'LoginSuccess';
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
  const { userId, newUserData } = requestBody;

  if (!userId || !newUserData) {
    const err = new Error('ValidationError: No UserId or New Data Provided');
    err.status = 400;
    throw err;
  }

  try {
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
  const fetchRequest = context.request.source;
  const rawBody = await fetchRequest.text();
  if (!rawBody) { throw new Error('Empty request body'); }
  const requestBody = JSON.parse(rawBody);
    const { userId } = requestBody;
  try {
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
  const userId = context.params.userId;
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
            getUserData
          }
