import { read as readConstant } from "../helper/constants.js";
import { Queue, QueueOptions } from "bullmq";

const queueOptions: QueueOptions = {
  connection: {
    host: 'sessions.internal',
  },
};

export const sessionsEventQueue = new Queue(
  readConstant('service.sessions.event-queue-name'),
  queueOptions
);
