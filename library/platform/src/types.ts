import { default as ContextualServerResponse } from "./contextual-server-response.js";
import { default as ContextualIncomingMessage } from "./contextual-incoming-message.js";

/**
 * Utility type that makes all properties in T deeply optional
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Helper type to extract new properties from OC, handling deep nesting
 */
export type NewPropertiesOnly<InputContext, OutputContext> = {
  [K in keyof OutputContext as K extends keyof InputContext
    ? InputContext[K] extends object
      ? OutputContext[K] extends object
        ? K
        : never
      : never
    : K
  ]?: K extends keyof InputContext
    ? InputContext[K] extends object
      ? OutputContext[K] extends object
        ? NewPropertiesOnly<InputContext[K], OutputContext[K]>
        : never
      : never
    : OutputContext[K];
};

export type Service = {
  close: (callback?: () => void) => void;
}

export type ServiceRequestContext = {
  incomingMessage: ContextualIncomingMessage;
  serverResponse: ContextualServerResponse;
}

export type CreateRequestHandlerOptions = {
  routes: Map<string, (context: ServiceRequestContext) => void>;
}

export type CreateServerOptions = {
  mTLSOptions?: {
    caPaths: Array<string>;
    rejectUnauthorized?: boolean;
    requestCert?: boolean;
  };
  sslOptions: {
    crtPath: string;
    keyPath: string;
  };
  port: number;
  routes: Record<string, unknown>;
}
