import { ServiceContext } from "../define-service";

/**
 *
 * @param context - The service context object
 */
export const useJSONBody = async (context: ServiceContext): Promise<unknown> => {
  let body = '';

  // Handle errors during data collection
  context.incomingMessage.on('error', (error) => {
    throw new Error(`Error collecting request body: ${error.message}`);
  });

  // collect chunks of data from the incoming message
  context.incomingMessage.on('data', (chunk: Buffer) => {
    body += chunk.toString();
  });

  // wait for the end of the incoming message
  await new Promise<void>((resolve) => {
    context.incomingMessage.on('end', () => {
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
