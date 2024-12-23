import { pgTable, serial, varchar, boolean, timestamp, integer, array } from "drizzle-orm/pg-core";

// User Table
export const UserTable = pgTable('users', {
  userId: serial('userId').primaryKey(),
  email: varchar('email').unique().notNull(),
  userName: varchar('userName').unique().notNull(),
  password: varchar('password').notNull(),
  googleId: varchar('googleId'),
  userIdOnBlockchain: varchar('userIdOnBlockchain').notNull(),
  files: array('files', varchar('fileId')),
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
});
