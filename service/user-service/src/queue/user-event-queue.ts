import { read as readConfig } from "@tw050x.net.library/configs";
import { Queue, QueueOptions } from "bullmq";

const queueOptions: QueueOptions = {
  connection: {
    host: 'user-service-redis.internal',
  },
};

export const userEventQueue = new Queue(
  readConfig('service.user.event-queue-name'),
  queueOptions
);
