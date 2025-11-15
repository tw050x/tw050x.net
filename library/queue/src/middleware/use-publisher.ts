import { Middleware, ServiceRequestContext } from "@tw050x.net.library/service";
import { Publisher, PublisherProps } from "rabbitmq-client";
import { rabbit } from "../client.js";

/**
 * Publisher
 */
export type QueuePublisher = {
  send: Publisher['send'];
}

type Exchange = {
  exchange: string;
  type: string;
}

/**
 * Options for the usePublisher middleware
 */
export type UsePublisherOptions = PublisherProps;

/**
 * Resulting context after the usePublisher middleware has run
 */
export type UsePublisherResultingContext = ServiceRequestContext & {
  incomingMessage: ServiceRequestContext['incomingMessage'] & {
    queuePublisher: QueuePublisher;
  }
}

/**
 * Factory type for the usePublisher middleware
 */
type Factory = (options?: UsePublisherOptions) => Middleware<
  ServiceRequestContext,
  UsePublisherResultingContext
>;

/**
 * @returns void
 */
export const usePublisher: Factory = (options?: UsePublisherOptions) => {
  const publisher = rabbit.createPublisher(options);

  return async (context) => {
    const send = publisher.send.bind(publisher);

    context.incomingMessage.queuePublisher = {
      send,
    };
  }
}
