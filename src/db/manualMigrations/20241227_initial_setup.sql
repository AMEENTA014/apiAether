-- User Table
CREATE TABLE users (
    userId SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    userName VARCHAR(255) NOT NULL UNIQUE,-- Assuming userName should also be unique
    password VARCHAR(255) NOT NULL,
    googleId VARCHAR(255),
    userIdOnBlockchain VARCHAR(255) ,
    referenceLocation VARCHAR(255) ,
    dataSharable BOOLEAN ,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);                    

-- File Table
CREATE TABLE files (
    fileId SERIAL PRIMARY KEY,
    userId INTEGER NOT NULL REFERENCES users(userId),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    expirationTime INTEGER NOT NULL,
    url VARCHAR(255) NOT NULL,
    fileuuid VARCHAR(255) NOT NULL,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Symptom Table
CREATE TABLE symptoms (
    symptomId SERIAL PRIMARY KEY,
    userId INTEGER NOT NULL REFERENCES users(userId), -- Added userId to reference the user table
    description TEXT NOT NULL,
    result TEXT NOT NULL,
    confidenceRateOfResult INTEGER NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
