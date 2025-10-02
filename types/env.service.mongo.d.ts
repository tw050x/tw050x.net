declare global {
  namespace NodeJS {
    interface ProcessEnv {
      MONGO_INITDB_ROOT_USERNAME: string;
      MONGO_INITDB_ROOT_PASSWORD: string;
      MONGO_REPLICA_SET_NAME: string;
    }
  }
}
export {};
