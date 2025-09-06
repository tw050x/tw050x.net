import { logger } from "@tw050x.net.library/logger";
import { defineService } from "@tw050x.net.library/service";
import { join } from "node:path";

defineService({
  getRoutesDirectory: () => join(__dirname, 'stack'),
  onPrepare: async (service) => {
    await Promise.all([
      service.configuration.use('error.service.allowed-origins'),
    ])
  },
  onReady: async (service) => {
    const onEndProcess = () => {
      service.configuration.destroy();
      service.database.destroy();
      service.secrets.destroy();
      const forceCloseTimeout = setTimeout(() => {
        logger.info('Server forced shut down');
        process.exit(1);
      }, 30_000);
      service.close(() => {
        clearTimeout(forceCloseTimeout);
        logger.info('Server shut down gracefully');
        process.exit(0);
      });
    }

    process.on('SIGINT', () => {
      logger.info('End process signal received, shutting down server...');
      onEndProcess();
    });
    process.on('SIGTERM', () => {
      logger.info('End process signal received, shutting down server...');
      onEndProcess();
    });
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught exception:', error);
      onEndProcess();
    });

    service.listen(3000, () => {
      logger.info(`Service is running on port 3000`);
    });
  }
});
