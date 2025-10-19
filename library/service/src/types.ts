import { default as ContextualServerResponse } from "./contextual-server-response";
import { default as ContextualIncomingMessage } from "./contextual-incoming-message";

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
  routesDirectory: string;
  port: number;
}
