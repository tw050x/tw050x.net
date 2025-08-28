import { mongoClient } from "@tw050x.net/service";

/**
 * Database object
 */
export const database = {
  authentication: {
    get credentials() {
      return mongoClient.db('authentication').collection('credentials');
    },
    get permissions() {
      return mongoClient.db('authentication').collection('permissions');
    },
    get nonces() {
      return mongoClient.db('authentication').collection('nonces');
    },
  }
}
