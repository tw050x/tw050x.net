import { read as readConstant } from "../helper/constants.js";
import { Queue, QueueOptions } from "bullmq";

const queueOptions: QueueOptions = {
  connection: {
    host: 'users.network',
  },
};

export const userEventQueue = new Queue(
  readConstant('service.users.event-queue-name'),
  queueOptions
);
