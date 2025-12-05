declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production';
      ENTER_YOUR_NAME_TASK_TEMPLATE_UUID: string;
      VERIFY_EMAIL_TASK_TEMPLATE_UUID: string;
    }
  }
}
export {};
