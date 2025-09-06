import { MongoClient, MongoClientOptions } from 'mongodb';

// Define MongoClientOptions configuration
const configuration: MongoClientOptions = {}

// Ensure that MONGO_CLIENT_URI is defined
if (process.env.MONGO_CLIENT_URI === undefined) {
  throw new Error('MONGO_CLIENT_URI is not defined')
}

const authPassword = process.env.MONGO_CLIENT_AUTH_PASSWORD;
const authUsername = process.env.MONGO_CLIENT_AUTH_USERNAME;

// Only assign auth username & password if they exist
authGuard: {
  if (authPassword === undefined) break authGuard;
  if (authPassword === '') break authGuard;
  if (authUsername === undefined) break authGuard;
  if (authUsername === '') break authGuard;
  configuration.auth = {
    password: authPassword,
    username: authUsername,
  }
}

export const mongoClient = new MongoClient(process.env.MONGO_CLIENT_URI, configuration);
