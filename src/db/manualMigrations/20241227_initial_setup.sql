-- Ensure the UUID extension is enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Table
CREATE TABLE users (
    userId UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    userName VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    googleId VARCHAR(255),
    userIdOnBlockchain VARCHAR(255),
    referenceLocation VARCHAR(255),
    dataSharable BOOLEAN,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- File Table
CREATE TABLE files (
    fileId UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    userId UUID NOT NULL REFERENCES users(userId),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    expirationTime INTEGER NOT NULL,
    url VARCHAR(255) NOT NULL,
    fileuuid UUID,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Symptom Table
CREATE TABLE symptoms (
    symptomId UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    userId UUID NOT NULL REFERENCES users(userId),
    description TEXT NOT NULL,
    result TEXT NOT NULL,
    confidenceRateOfResult INTEGER NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
