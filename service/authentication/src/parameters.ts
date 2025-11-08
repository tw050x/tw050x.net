import { logger } from "@tw050x.net.library/logger";
import { ServiceParameters } from "@tw050x.net.library/parameters";

export const serviceParameters = new ServiceParameters([
  'authentication.service.allowed-origins',
  'authentication.service.host',
  'authentication.service.login-enabled',
  'cookie.access-token.name',
  'cookie.access-token.domain',
  'cookie.login-state.name',
  'cookie.login-state.domain',
  'cookie.refresh-token.domain',
  'cookie.refresh-token.name',
  'cookie.refreshable-token.name'
]);

await serviceParameters.synchroniseServiceParameters();
await serviceParameters.hasSynchronised();

serviceParameters.startSynchroniseInterval(5 * 60 * 1000) // every 5 minutes

process.on('SIGINT', async () => {
  await serviceParameters.stopSynchroniseInterval();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await serviceParameters.stopSynchroniseInterval();
  process.exit(0);
});

process.on('uncaughtException', async (error) => {
  logger.debug('An Uncaught Exception Occured');
  logger.error(error);
  await serviceParameters.stopSynchroniseInterval();
  process.exit(1);
});

process.on('unhandledRejection', async (reason, promise) => {
  logger.debug('An Unhandled Rejection Occured');
  logger.error('Reason:', reason);
  logger.error('Promise:', promise);
  await serviceParameters.stopSynchroniseInterval();
  process.exit(1);
});
