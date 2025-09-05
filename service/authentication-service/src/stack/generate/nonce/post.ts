import { database as authenticationDatabase } from "@tw050x.net/authentication-database";
import { logger } from "@tw050x.net/logger-library";
import { useCors } from "@tw050x.net/middleware-library/use-cors";
import { defineServiceMiddleware } from "@tw050x.net/service-library";
import { sendOKTextResponse } from "@tw050x.net/service-library/helper";
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
      existingNonce = await authenticationDatabase.nonces.findOne({ value: nonce });
    }
    while (existingNonce !== null);
    await authenticationDatabase.nonces.insertOne({ createdAt: new Date(), value: nonce });

    // return the nonce
    return void sendOKTextResponse(context, nonce);
  }
])
