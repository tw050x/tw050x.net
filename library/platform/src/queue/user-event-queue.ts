import { read as readConfig } from "../helper/configs.js";
import { Queue, QueueOptions } from "bullmq";

const queueOptions: QueueOptions = {
  connection: {
    host: 'users.network',
  },
};

export const userEventQueue = new Queue(
  readConfig('service.users.event-queue-name'),
  queueOptions
);
