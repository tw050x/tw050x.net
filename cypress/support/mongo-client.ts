import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { MongoClient, MongoClientOptions } from 'mongodb';

// Define MongoClientOptions configuration
const configuration: MongoClientOptions = {}

// Retrieve the client URI from config
const clientURI = readFileSync(resolve(__dirname, '..', '..', '.configs', 'mongo.client.uri'), 'utf-8').trim()

// Ensure that mongo.client.uri is readable
if (clientURI === undefined) {
  throw new Error('the mongo.client.uri is not readable')
}

// Only assign auth username & password if they exist
const authPassword = readFileSync(resolve(__dirname, '..', '..', '.secrets', 'mongo.client.auth-password'), 'utf-8').trim();
const authUsername = readFileSync(resolve(__dirname, '..', '..', '.configs', 'mongo.client.auth-username'), 'utf-8').trim();
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

export const mongoClient = new MongoClient(clientURI, configuration);
