declare global {
  namespace NodeJS {
    interface ProcessEnv {
      RABBITMQ_USER: string;
      RABBITMQ_PASSWORD: string;
      RABBITMQ_HOST: string;
      RABBITMQ_PORT: string;
      RABBITMQ_VHOST?: string;
    }
  }
}
export {};
