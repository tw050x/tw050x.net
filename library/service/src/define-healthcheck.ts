import { readFileSync, writeFileSync } from "node:fs";

/**
 * Healthcheck variable determines if the service is healthy or not.
 */
let unrecoverableErrorOccured = false;

/**
 *
 */
type DefintHealthcheckOptions = {
  filePath: string;
  checkInterval: number;
}

/**
 * Defines a healthcheck mechanism that periodically writes the service health status to a file.
 */
export default function defineHealthcheck(options: DefintHealthcheckOptions) {
  const read = (): 'healthy' | 'unhealthy' => {
    const healthcheckFileRawContent = readFileSync(options.filePath, 'utf-8');

    switch (healthcheckFileRawContent) {
      case 'unhealthy': return 'unhealthy';
      case 'healthy': return 'healthy';
      default:
        unrecoverableErrorOccured = true;
        clearInterval(intervalId);
        throw new Error(`Invalid healthcheck file content: ${healthcheckFileRawContent}`);
    }
  }

  const error = () => {
    unrecoverableErrorOccured = true;
    clearInterval(intervalId);
  }

  const writeHealthStatusToFile = () => {
    writeFileSync(options.filePath, unrecoverableErrorOccured ? 'unhealthy' : 'healthy', 'utf-8')
  }

  const stop = () => {
    clearInterval(intervalId);
  }

  const intervalId = setInterval(
    writeHealthStatusToFile,
    options.checkInterval,
  )

  writeHealthStatusToFile();

  return {
    read,
    stop,
    error,
  }
};
