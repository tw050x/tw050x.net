import { database } from "@tw050x.net/database";
import { default as logger } from "@tw050x.net/logger";
import { useCors } from "@tw050x.net/middleware/use-cors";
import { defineServiceMiddleware } from "@tw050x.net/service";
import { sendOKTextResponse } from "@tw050x.net/service/helper";
import { randomBytes } from "node:crypto";
import { Document } from "mongodb";

/**
 * The stack for the POST request to generate a nonce
 */
export default defineServiceMiddleware([
  async (context) => {
    logger.debug(`POST ${context.incomingMessage.url}`);
  },
  useCors({
    getConfiguration: async () => ({
      allowedMethods: ['POST', 'OPTIONS'],
      allowedOrigins: '*',
    }),
  }),
  // TODO: add authentication middleware
  async (context) => {

    // generate a nonce until it is unique
    // then store that nonce in the database
    let nonce: string;
    let existingNonce: Document | null;
    do {
      nonce = randomBytes(16).toString('hex');
      existingNonce = await database.authentication.nonces.findOne({ value: nonce });
    }
    while (existingNonce !== null);
    await database.authentication.nonces.insertOne({ createdAt: new Date(), value: nonce });

    // return the nonce
    return void sendOKTextResponse(context, nonce);
  }
])
