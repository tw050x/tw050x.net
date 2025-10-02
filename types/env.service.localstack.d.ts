declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DEBUG: string;
      PERSIST_DEFAULT: string;
      PERSIST_SSM: string;
    }
  }
}
export {};
