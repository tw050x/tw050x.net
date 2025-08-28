import { default as logger } from "@tw050x.net/logger";
import { defineService } from "@tw050x.net/service";
import { join } from "node:path";

const onClose = () => {
  logger.info('Server shut down gracefully');
  process.exit(0);
}

defineService({
  getRoutesDirectory: () => join(__dirname, 'stack'),
  onPrepare: async (service) => {
    await Promise.all([
      service.configuration.use('authentication.service.allowed-origins'),
      service.configuration.use('authentication.service.allowed-return-url-domains'),
      service.configuration.use('authentication.service.host'),
      service.configuration.use('cookie.access-token.name'),
      service.configuration.use('cookie.access-token.domain'),
      service.configuration.use('cookie.login-state.name'),
      service.configuration.use('cookie.login-state.domain'),
      service.configuration.use('cookie.refresh-token.name'),
      service.configuration.use('cookie.refresh-token.domain'),
      service.configuration.use('cookie.refreshable-token.name'),
      service.configuration.use('cookie.refreshable-token.domain'),
      service.secrets.use('encrypter.secret-key'),
      service.secrets.use('jwt.secret-key'),
    ]);
  },
  onReady: async (service) => {
    const onEndProcess = () => {
      logger.info('End process signal received,shutting down server...');
      service.close(onClose);
    }

    process.on('SIGINT', onEndProcess);
    process.on('SIGTERM', onEndProcess);

    service.listen(3000, () => {
      logger.info(`Service is running on port 3000`);
    });
  }
});
