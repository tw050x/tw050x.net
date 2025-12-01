import { read as readConfig } from "../helper/configs.js";
import { Queue, QueueOptions } from "bullmq";

const queueOptions: QueueOptions = {
  connection: {
    host: 'user-redis.internal',
  },
};

export const userEventQueue = new Queue(
  readConfig('service.user.event-queue-name'),
  queueOptions
);
