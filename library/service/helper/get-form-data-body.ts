import { IncomingMessage } from "node:http";

/**
 * Extracts form data from an HTTP request body.
 * Parses URL-encoded form data (application/x-www-form-urlencoded) into a key-value object.
 * Returns null if the body cannot be parsed as form data.
 *
 * Example:
 * const formData = await getFormDataBody(request);
 * // Returns: { name: "John", email: "john@example.com" }
 */
export default async function getFormDataBody(incomingMessage: IncomingMessage): Promise<Record<string, string> | null> {
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

  let result: Record<string, string> | null;

  try {
    result = Object.fromEntries(new URLSearchParams(body));
  }
  catch (error) {
    result = null;
  }

  return result;
}
