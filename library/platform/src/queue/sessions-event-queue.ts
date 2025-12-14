import { read as readConfig } from "../helper/configs.js";
import { Queue, QueueOptions } from "bullmq";

const queueOptions: QueueOptions = {
  connection: {
    host: 'sessions.internal',
  },
};

export const sessionsEventQueue = new Queue(
  readConfig('service.sessions.event-queue-name'),
  queueOptions
);
