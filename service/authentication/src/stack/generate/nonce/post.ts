import { database as authenticationDatabase } from "@tw050x.net.database/authentication";
import { useCorsHeaders, UseCorsHeadersFactoryOptions } from "@tw050x.net.library/middleware/use-cors-headers";
import { useLogRequest } from "@tw050x.net.library/middleware/use-log-request";
import { defineServiceMiddleware } from "@tw050x.net.library/service";
import { randomBytes } from "node:crypto";
import { Document } from "mongodb";

const useCorsHeadersOptions: UseCorsHeadersFactoryOptions = {
  allowedMethods: ['POST', 'OPTIONS'],
  allowedOrigins: '*',
};

/**
 * The stack for the POST request to generate a nonce
 */
export default defineServiceMiddleware([
  useLogRequest(),
  useCorsHeaders(useCorsHeadersOptions),

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
    return void context.serverResponse.sendOKTextResponse(nonce);
  }
])
