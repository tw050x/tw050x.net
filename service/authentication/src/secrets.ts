import { logger } from "@tw050x.net.library/logger";
import { ServiceSecrets as ServiceSecrets } from "@tw050x.net.library/secrets";

export const serviceSecrets = new ServiceSecrets([
  'jwt.secret-key',
  'encrypter.secret-key',
]);

await serviceSecrets.synchroniseServiceSecrets();
await serviceSecrets.hasSynchronised();

serviceSecrets.startSynchroniseInterval(5 * 60 * 1000) // every 5 minutes

process.on('SIGINT', async () => {
  await serviceSecrets.stopSynchroniseInterval();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await serviceSecrets.stopSynchroniseInterval();
  process.exit(0);
});

process.on('uncaughtException', async (error) => {
  logger.debug('An Uncaught Exception Occured');
  logger.error(error);
  await serviceSecrets.stopSynchroniseInterval();
  process.exit(1);
});

process.on('unhandledRejection', async (reason, promise) => {
  logger.debug('An Unhandled Rejection Occured');
  logger.error('Reason:', reason);
  logger.error('Promise:', promise);
  await serviceSecrets.stopSynchroniseInterval();
  process.exit(1);
});
