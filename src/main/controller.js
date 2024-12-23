const tempStore = new Map(); // In-memory store for temporary data

export const signUpUserController = async (context) => {
  const { email, username, password, role } = await context.request.body().value;
  
  if (!email || !username || !password) {
    throw new Error('ValidationError');
  }

  const existingUser = await getUserByEmailModel(email);
  if (existingUser.length) {
    throw new Error('ValidationError');
  }

  const { otp, secret } = await generateOtp();
  const id = await generateUniqueId();

  tempStore.set(id, {
    otp, email, secret, pass: await hashPass(password), username, role, action: 'signUp'
  });

  setTimeout(() => tempStore.delete(id), 600000); // Set expiration to 10 minutes

  const message = `Your OTP is ${otp}. Click this link for signup verification: ${process.env.VERIFYLINK}?id=${id}`;
  await sendEMail(email, 'signupVerify', message);
  context.response.status = 200;
  context.response.body = { message: 'OTP sent to email' };
};

//verify signup
//import * as middleWares from './middlewares/index.js';

export const verifyController = async (context) => {
  const { otp, id } = await context.request.body().value;

  if (!id || !otp) {
    throw new Error('ValidationError: Id or OTP not provided');
  }

  if (!tempStore.has(id)) {
    throw new Error('ValidationError: OTP expired or invalid');
  }

  const data = tempStore.get(id);

  if (!(await middleWares.tOtpVerify(data, otp))) {
    throw new Error('ValidationError: Invalid OTP');
  }

  if (data.action === 'signUp') {
    const userData = {
      email: data.email,
      userName: data.username,
      password: data.pass,
      role: data.role,
      userIdOnBlockchain: 'generated-blockchain-id', // Placeholder
      files: [],
      referenceLocation: 'default-location',
      dataSharable: true
    };
    await createUserModel(userData);
    context.response.status = 200;
    context.response.cookies.set('token', await middleWares.createToken(userData), { httpOnly: true });
    context.response.body = 'SignUpSuccessLoginned';
  }
};

//signin 

const client = new OAuth2Client(Deno.env.get('GOOGLE_CLIENT_ID'));

export const googleSignInController = async (context) => {
  const { idToken } = await context.request.body().value;

  if (!idToken) {
    throw new Error('ValidationError: ID token is required');
  }

  const ticket = await client.verifyIdToken({
    idToken,
    audience: Deno.env.get('GOOGLE_CLIENT_ID'),
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

//login 

export const loginUserController = async (context) => {
  const { email, password } = await context.request.body().value;

  if (!email || !password) {
    throw new Error('ValidationError: Both email and password are required');
  }

  const user = await userModels.getUserByEmailModel(email);

  if (!user) {
    throw new Error('ValidationError: User does not exist');
  }

  const validPassword = await middleWares.validatePassword(password, user.password);

  if (!validPassword) {
    throw new Error('ValidationError: Invalid password');
  }

  context.response.status = 200;
  context.response.cookies.set('token', await middleWares.createToken(user), { httpOnly: true });
  context.response.body = 'LoginSuccess';
};
//logout 
export const logoutUserController = async (context) => {
    context.response.cookies.delete('token');
    context.response.status = 200;
    context.response.body = 'LogoutSuccess';
  };
  
