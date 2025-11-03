declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PAYMENT_DATABASE_NAME: string;
      PAYMENT_DATABASE_NONCES_COLLECTION_NAME: string;
    }
  }
}
export {};
