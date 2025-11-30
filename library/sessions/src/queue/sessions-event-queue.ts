import { read as readConfig } from "@tw050x.net.library/configs";
import { Queue, QueueOptions } from "bullmq";

const queueOptions: QueueOptions = {
  connection: {
    host: 'sessions-redis.internal',
  },
};

export const sessionsEventQueue = new Queue(
  readConfig('service.sessions.event-queue-name'),
  queueOptions
);
