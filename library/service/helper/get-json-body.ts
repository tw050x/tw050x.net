import { IncomingMessage } from "node:http";

/**
 *
 */
export default async function getJSONBody(incomingMessage: IncomingMessage): Promise<unknown> {
  let body = '';

  // Handle errors during data collection
  incomingMessage.on('error', (error) => {
    throw new Error(`Error collecting request body: ${error.message}`);
  });

  // collect chunks of data from the incoming message
  incomingMessage.on('data', (chunk: Buffer) => {
    body += chunk.toString();
  });

  // wait for the end of the incoming message
  await new Promise<void>((resolve) => {
    incomingMessage.on('end', () => {
      resolve();
    });
  });

  let result: unknown | null;

  try {
    result = JSON.parse(body);
  }
  catch (error) {
    result = null;
  }

  return result;
}
