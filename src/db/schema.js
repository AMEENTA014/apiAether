/*import { pgTable, serial, varchar, boolean, timestamp, integer} from "drizzle-orm/pg-core";

// User Table
export const UserTable = pgTable('users', {
  userId: serial('userId').primaryKey(),
  email: varchar('email').notNull,
  userName: varchar('userName').notNull(),
  password: varchar('password').notNull(),
  googleId: varchar('googleId'),
  userIdOnBlockchain: varchar('userIdOnBlockchain').notNull(),
  files: varchar('files').notNull(),
  referenceLocation: varchar('referenceLocation').notNull(),
  dataSharable: boolean('dataSharable').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

// File Table
export const FileTable = pgTable('files', {
  fileId: serial('fileId').primaryKey(),
  userId: integer('userId').references(UserTable, 'userId').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  expirationTime: integer('expirationTime').notNull(),
  url: varchar('url').notNull(),
  fileuuid: varchar('fileuuid').notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

// Symptom Table
export const SymptomTable = pgTable('symptoms', {
  symptomId: serial('symptomId').primaryKey(),
  description: varchar('description').notNull(),
  result: varchar('result').notNull(),
  confidenceRateOfResult: integer('confidenceRateOfResult').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
}); */
import { pgTable, serial, varchar, boolean, timestamp, integer, text } from "drizzle-orm/pg-core";

// User Table
export const UserTable = pgTable('users', {
  userId: serial('userId').primaryKey(),
  email: varchar('email', { length: 255 }).notNull(),  // Ensuring email is unique
  userName: varchar('userName', { length: 255 }).notNull(),
  password: varchar('password', { length: 255 }).notNull(),
  googleId: varchar('googleId', { length: 255 }),
  userIdOnBlockchain: varchar('userIdOnBlockchain', { length: 255 }).notNull(),
  files: varchar('files', { length: 255 }).notNull(),
  referenceLocation: varchar('referenceLocation', { length: 255 }).notNull(),
  dataSharable: boolean('dataSharable').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

// File Table
export const FileTable = pgTable('files', {
  fileId: serial('fileId').primaryKey(),
  userId: integer('userId').references(() => UserTable.userId).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  expirationTime: integer('expirationTime').notNull(),
  url: varchar('url', { length: 255 }).notNull(),
  fileuuid: varchar('fileuuid', { length: 255 }).notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

// Symptom Table
export const SymptomTable = pgTable('symptoms', {
  symptomId: serial('symptomId').primaryKey(),
  description: text('description').notNull(),
  result: text('result').notNull(),
  confidenceRateOfResult: integer('confidenceRateOfResult').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});


//trying a new code 

