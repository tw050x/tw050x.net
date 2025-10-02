declare global {
  namespace NodeJS {
    interface ProcessEnv {
      MONGO_CLIENT_AUTH_PASSWORD: string;
      MONGO_CLIENT_AUTH_USERNAME: string;
      MONGO_CLIENT_REPLICA_SET: string;
      MONGO_CLIENT_URI: string;
    }
  }
}
export {};
