import { SSMClient, SSMClientConfig } from "@aws-sdk/client-ssm";

// Define SSMClient configuration
const configuration: SSMClientConfig = {
  region: process.env.AWS_REGION,
}

const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

// Only assign credentials as they exist
credentialsGuard: {
  if (accessKeyId === undefined) break credentialsGuard;
  if (accessKeyId === '') break credentialsGuard;
  if (secretAccessKey === undefined) break credentialsGuard;
  if (secretAccessKey === '') break credentialsGuard;
  configuration.credentials = {
    accessKeyId,
    secretAccessKey,
  };
}

const endpoint = process.env.AWS_ENDPOINT;

// Only assign endpoint if it exists
endpointGuard: {
  if (endpoint === undefined) break endpointGuard;
  configuration.endpoint = endpoint;
}

export const ssmClient = new SSMClient(configuration);
