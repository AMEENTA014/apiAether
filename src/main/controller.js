import {getUserByEmailModel,createUser} from  "../db/index.js";
import middleWares from "./middleWare.js";
const tempStore = new Map(); // In-memory store for temporary data
const env = Deno.env ;
export const signUpUserController = async (context) => {
  const { email, username, password } = await context.request.body().value;
  
  if (!email || !username || !password) {
    throw new Error('ValidationError');
  }

  const existingUser = await getUserByEmailModel(email);
  if (existingUser.length) {
    throw new Error('ValidationError');
  }

  const { otp, secret } = middleWares.generateOtp();
  const id =  middleWares.generateUniqueId();

  tempStore.set(id, {
    otp, email, secret, pass: await middleWares.hashPass(password), username, action: 'signUp'
  });

  setTimeout(() => tempStore.delete(id), 600000); // Set expiration to 10 minutes

  const message = `Your OTP is ${otp}. Click this link for signup verification: ${env.get('VERIFYLINK')}?id=${id}`;
  await middleWares.sendEMail(email, 'signupVerify', message);
  context.response.status = 200;
  context.response.body = { message: 'OTP sent to email' };
};

//verify signup
//import * as middleWares from './middlewares/index.js';

export const verifyController = async (context) => {
  const { otp, id } = await context.request.body().value;

  if (!id || !otp) {
    const err = new Error('ValidationError: Id or OTP not provided');
    err.status = 400;
    throw err ;
  }

  if (!tempStore.has(id)) {
    const err = new Error('ValidationError: OTP expired or invalid');
    err.status = 400;
    throw err ;
  }

  const data = tempStore.get(id);

  if (!(middleWares.verifyOtp(data, otp))) {
    const err = new Error('ValidationError: Invalid OTP');
    err.status = 400;
    throw err ;
  }

  if (data.action === 'signUp') {
    const userData = {
      email: data.email,
      userName: data.username,
      password: data.pass,
      userIdOnBlockchain: 'generated-blockchain-id', // Placeholder
      files: [],
      referenceLocation: 'default-location',
      dataSharable: true
    };
    await createUser(userData);
    context.response.status = 200;
    context.response.cookies.set('token', await middleWares.createToken(userData), { httpOnly: true });
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
  const { email, password } = await context.request.body().value;

  if (!email || !password) {
    const err = new Error('ValidationError: Both email and password are required');
    err.status = 400;
    throw err;
  }

  const user = await userModels.getUserByEmailModel(email);

  if (!user) {
    const err = new Error('ValidationError: User does not exist');
    err.status = 400;
    throw err;
  }

  const validPassword = await middleWares.validatePassword(password, user.password);

  if (!validPassword) {
    const err = new  Error('ValidationError: Invalid password');
    err.status = 400;
    throw err;
  }

  context.response.status = 200;
  context.response.cookies.set('token', await middleWares.createToken(user), { httpOnly: true });
  context.response.body = 'LoginSuccess';
};
//logout 
export const logoutUserController =  (context) => {
    context.response.cookies.delete('token');
    context.response.status = 200;
    context.response.body = 'LogoutSuccess';
  };
  // forgot password 
  export const forgotPasswordController = async (context) => {
     const { email } = await context.request.body().value;
      if (!email) { 
        const err = new Error("EmailRequired"); 
        err.status = 400; 
        throw err; 
      } 
      try 
      { 
        const user = await userModels.getUserByEmailModel(email);
         if (!user) 
          {
             const err = new Error("User doesn't exist");
           err.status = 400; throw err;
           } 
           const resetId =  middleWares.generateUniqueId(); 
           tempStore.set(resetId, JSON.stringify({ email: email, userId: user.userId }));
           setTimeout(() => { tempStore.delete(key) , 600 * 1000}); 
            const resetLink = `${env.get('RESETLINK')}/${resetId}`; 
            await middleWares.sendEMail(email, 'resetPass', `Click this link to reset your password: ${resetLink}`); 
            context.response.status = 200; context.response.body = { message: "ResetLinkSent" };
           } catch (err) { 
            throw err;
           } 
          };

          //reset password 
          export const resetPassWordController = async (context) => {
             const { email } = await context.request.body().value;
              if (!email) {
                 throw new Error("Email required"); 
                } const userId = context.state.roleData.userId; 
                const user = await userModels.getUserModel(userId); 
                if (user.email !== email) { 
                  throw new Error("forbidden"); 
                } const resetId = middleWares.generateUniqueId(); 
                tempStore.set(resetId, JSON.stringify({ userId })); 
                setTimeout(() => tempStore.delete(resetId), 600000);
                   const resetLink = `${env.get('RESETLINK')}/id=${resetId}`;
                   const message = `Click this link to reset your password: ${resetLink}`; 
                   await sendEmail(email, 'resetPass', message); 
                   context.response.status = 200;
            context.response.body = { success: true };
          }
//reset pass verify 
export const verifyResetPasswordController = async (context) => { 
  const { resetId, newPassword } = await context.request.body().value;
   if (!resetId || !newPassword) {
     throw new Error("Reset ID and new password are required");
     } 
     const data = JSON.parse(tempStore.get(resetId) || "{}");
      if (!data.userId) { 
        throw new Error("Reset link expired"); 
      } const updatedUser = await userModels.updateUserModel(data.userId, { 
        password: await middleWares.hashPass(newPassword)
      });
       context.response.status = 200; 
       context.response.body = updatedUser;
    }
          export default{
            forgotPasswordController,
            loginUserController,
            logoutUserController,
            signUpUserController,
            verifyController
          }
