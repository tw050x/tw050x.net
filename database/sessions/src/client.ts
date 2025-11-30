import { MongoClient, MongoClientOptions } from 'mongodb';

// Define MongoClientOptions configuration
const configuration: MongoClientOptions = {}

// Ensure that MONGO_CLIENT_URI is defined
if (process.env.MONGO_CLIENT_URI === undefined) {
  throw new Error('MONGO_CLIENT_URI is not defined')
}


// Only assign auth username & password if they exist
const authPassword = process.env.MONGO_CLIENT_AUTH_PASSWORD;
const authUsername = process.env.MONGO_CLIENT_AUTH_USERNAME;
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

// Only assign replicaSet if it exists
const replicaSet = process.env.MONGO_CLIENT_REPLICA_SET;
replicaSetGuard: {
  if (replicaSet === undefined) break replicaSetGuard;
  if (replicaSet === '') break replicaSetGuard;
  configuration.replicaSet = replicaSet;
}

export const mongoClient = new MongoClient(process.env.MONGO_CLIENT_URI, configuration);

process.on('SIGINT', async () => {
  await mongoClient.close();
});

process.on('SIGTERM', async () => {
  await mongoClient.close();
});

process.on('uncaughtException', async (error) => {
  console.error('Uncaught Exception:', error);
  await mongoClient.close();
});
