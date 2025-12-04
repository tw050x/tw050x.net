import { read as readConfig } from "./helper/configs.js";
import { read as readSecret } from "./helper/secrets.js";
import { MongoClient, MongoClientOptions } from 'mongodb';

// Define MongoClientOptions configuration
const configuration: MongoClientOptions = {}

// retrieve the client URI from config
const clientURI = await readConfig('mongo.client.uri');

// Ensure that MONGO_CLIENT_URI is defined
if (clientURI === undefined) {
  throw new Error('MONGO_CLIENT_URI is not defined')
}

// Only assign auth username & password if they exist
const authPassword = await readSecret('mongo.client.auth-password');
const authUsername = await readConfig('mongo.client.auth-username');
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
const replicaSet = await readConfig('mongo.server.replica-set');
replicaSetGuard: {
  if (replicaSet === undefined) break replicaSetGuard;
  if (replicaSet === '') break replicaSetGuard;
  configuration.replicaSet = replicaSet;
}

export const mongoClient = new MongoClient(clientURI, configuration);
