import { create } from 'djwt';
// errorHandler.js
export const errorHandler = async(context, next) => {
  try {
    await next();
  } catch (err) {
    let statusCode;
    let message;

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
      statusCode = 500;
      message = 'Internal Server Error';
    }

    context.response.status = statusCode;
    context.response.body = { error: message };
  }
};

export async function generateOtp() {
    // Implementation for OTP generation
  }
  
  export async function generateUniqueId() {
    // Implementation for unique ID generation
  }
  
  export async function hashPass(password) {
    // Implementation for password hashing
  }
  
  export async function validatePassword(inputPassword, storedPassword) {
    // Implementation for password validation
  }
  
  export async function sendEMail(to, subject, message) {
    // Implementation for sending email
  }
  


const secret = Deno.env.get('PrivateOrSecretKey');

export const createToken = async (user) => {
  const payload = { username: user.userName, userId: user.userId };
  const token = await create({ alg: 'HS256', typ: 'JWT' }, payload, secret);
  return token;
};

  
  export async function tOtpVerify(data, otp) {
    // Implementation for TOTP verification
  }
  
  // Redis functions
  export async function setValue(client, key, value) {
    // Implementation for setting a value in Redis
  }
  
  export async function getValue(client, key) {
    // Implementation for getting a value from Redis
  }
  
  export async function setExpire(client, key, time) {
    // Implementation for setting expiration in Redis
  }
  
  export async function isExpired(client, key) {
    // Implementation for checking expiration in Redis
  }
  