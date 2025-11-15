import { logger } from "@tw050x.net.library/logger";
import { Connection } from "rabbitmq-client";

const user = process.env.RABBITMQ_USER
const password = process.env.RABBITMQ_PASSWORD
const host = process.env.RABBITMQ_HOST
const port = process.env.RABBITMQ_PORT
const vhost = process.env.RABBITMQ_VHOST || '/'

const url = new URL(`amqp://${user}:${password}@${host}:${port}/${vhost}`);

export const rabbit = new Connection(url.toString());

rabbit.on('error', (error) => {
  logger.error(error)
  logger.debug('RabbitMQ connection error');
});

rabbit.on('connection', () => {
  logger.info('Connection successfully (re)established');
});
