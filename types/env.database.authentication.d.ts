declare global {
  namespace NodeJS {
    interface ProcessEnv {
      AUTHENTICATION_DATABASE_NAME: string;
      AUTHENTICATION_DATABASE_NONCES_COLLECTION_NAME: string;
    }
  }
}
export {};
