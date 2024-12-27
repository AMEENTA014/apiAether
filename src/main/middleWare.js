import { create,verify }  from 'djwt';
import * as bcrypt from 'bcrypt';
import * as OTPAuth from 'otpauth';
import { SMTPClient } from "denomailer";
import {load} from "dotenv";
const env = await load({ export:true});
// errorHandler.js
export const errorHandler = async(context, next) => {
  try {
    console.log('f');
    await next();
  } catch (err) {
    let statusCode;
    let message;
console.log(err);
    if (err.message === 'DatabaseConnectionError') {
      statusCode = 500;
      message = 'Internal Server Error: Database connection failed.';
    } else if (err.message === 'ValidationError') {
      statusCode = 400;
      message = 'Bad Request: Validation error.';
    } else if (err.message === 'AuthenticationError') {
      statusCode = 401;
      message = 'Unauthorized: Authentication failed.';
    } else if (err.message === 'NotFoundError') {
      statusCode = 404;
      message = 'Not Found: The requested resource was not found.';
    } else {
        if(!err.statusCode){
        statusCode = err.statusCode;
      }  else {
        statusCode = 500;
      }
      message = err.message;
    }

    context.response.status = statusCode;
    context.response.body = { error: message };
  }
};

//authenticate 

export const authenticate = async (context, next) => {
  const token = context.cookies.get('token');
  if (!token) {
    throw new Error('Unauthorized');
  }
  try {
    const payload = await verify(token, env.PrivateOrSecretKey, 'HS256');
    context.state.roleData = payload;
    context.state.authenticated = true;
    await next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new Error('Session expired. Please log in again.');
    }
    throw new Error(`Unauthorized: ${err.message}`);
  }
};

//generate otp 
export const generateOtp = () => { 
  const secret = new OTPAuth.Secret();
   const totp = new OTPAuth.TOTP({ secret: secret, algorithm: "SHA1", digits: 6, period: 30, }); 
   const token = totp.generate(); // Ensure to return the base32 encoded secret 
return { otp: token, secret: secret.base32 };
}
export const verifyOtp = (data, otp) => {
   const  totp = new OTPAuth.TOTP({ 
    algorithm: "SHA1", 
    digits: 6, 
    period: 30,
     secret: OTPAuth.Secret.fromBase32(data.secret) 
    }); 
    const  delta = totp.validate({ token: otp, window: 1 });
  return delta !== null; 
  }// returns true if the OTP is valid, false otherwise

  //hash and validate pass 
  export const hashPass = async (password) => {
     try { 
      return await bcrypt.hash(password, 10);
     }
   catch (err) {
     throw new Error('Error while hashing password'+err);
    }}
  export const validatePassword = async (pass, dbPass) => {
    try {
      return await bcrypt.compare(pass, dbPass);
    } catch (err) {
      throw new Error(`passwordValidation Error ${err}`);
    }
  };
  
  //sendmail

  export const sendEMail = async (email, subject, message) => {
    const client = new SMTPClient({
      connection: {
        hostname: "smtp.gmail.com",
        port: 587,
        tls: true,
        auth: {
          username: env.MYMAIL,
          password: env.MAILPASS,
        },
      },
    });
  
    const mailOptions = {
      from: env.MYMAIL,
      to: email,
      subject: subject,
      content: message,
      html: `<p>${message}</p>`, // pls change accordingly 
    };
  
    try {
      await client.send(mailOptions);
      await client.close();
      return { message: 'Email sent successfully' };
    } catch (error) {
      throw new Error("Error in mailSending: " + error.message);
    }
  };
  
  
export const generateUniqueId =  () => {
  return crypto.randomUUID().toString();
};
export const createToken = async (user) => {
  const payload = { username: user.userName, userId: user.userId, role: user.role };
  const token = await create({ alg: 'HS256', typ: 'JWT' }, payload, env.PrivateOrSecretKey);
  return token;
};

export default { 
  errorHandler,
  generateOtp, 
  generateUniqueId,
  hashPass, 
  validatePassword, 
  sendEMail,
  createToken, 
  verifyOtp
    };
