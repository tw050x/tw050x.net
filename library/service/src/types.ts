import { IncomingMessage, ServerResponse } from "node:http";

export type Service = {
  close: (callback?: () => void) => void;
}

export type ServiceRequestContext = {
  incomingMessage: IncomingMessage;
  serverResponse: ServerResponse;
}

export type CreateRequestHandlerOptions = {
  routes: Map<string, (context: ServiceRequestContext) => void>;
}

export type CreateServerOptions = {
  routesDirectory: string;
  port: number;
}
