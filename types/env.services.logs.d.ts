declare global {
  namespace NodeJS {
    interface ProcessEnv {
      LOGS_LEVEL: string;
      LOGS_DIRECTORY: string;
    }
  }
}
export {};
