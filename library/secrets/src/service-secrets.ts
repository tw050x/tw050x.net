import { BatchGetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import { logger } from "@tw050x.net.library/logger";
import { EventEmitter } from "node:events";
import { secretsManagerClient } from "./client.js";

/**
 * Service Secrets class
 */
export default class ServiceSecrets<Keys extends string> {

  /**
   * Secret cache
   */
  private cache: Record<Keys, string> = {} as Record<Keys, string>;

  /**
   * Event emitter for secret events
   */
  private eventEmitter = new EventEmitter();

  /**
   * Whether the secrets have been initialised
   */
  private firstSynchronisedPromise: Promise<boolean>;

  /**
   * Whether the secrets have been initialised
   */
  public hasSynchronised(): Promise<boolean> {
    return this.firstSynchronisedPromise;
  }

  /**
   * Constructor
   */
  constructor(secretIDs: Array<Keys>) {

    // Initialise the cache
    for (const secretID of secretIDs) {
      this.cache[secretID] = '<uninitialised>';
    }

    // Initialise the first synchronised promise
    this.firstSynchronisedPromise = new Promise<boolean>((resolve) => {
      this.eventEmitter.once('initialised', (success: boolean) => {
        resolve(success);
      });
    });
  }

  /**
   * Abort controller for synchronisation requests
   */
  private abortController: AbortController | null = null;

  /**
   * Synchronise service secrets from SSM
   */
  async synchroniseServiceSecrets(): Promise<void> {
    logger.debug('Synchronising service secrets');

    // Abort any existing synchronisation
    if (this.abortController !== null) {
      this.abortController.abort();
      this.abortController = null;
    }

    const command = new BatchGetSecretValueCommand({
      SecretIdList: Object.keys(this.cache),
    });

    this.abortController = new AbortController();

    let response;
    try {
      response = await secretsManagerClient.send(command, {
        abortSignal: this.abortController.signal
      });
    }
    catch (error) {
      logger.error(error);
      logger.debug('Failed to synchronise service secrets');
      return void this.eventEmitter.emit('initialised', false);
    }

    for (const secret of response.SecretValues ?? []) {
      if (secret.Name && secret.SecretString) {
        this.cache[secret.Name as Keys] = secret.SecretString;
      }
    }

    this.eventEmitter.emit('initialised', true);
    logger.debug('Service secrets synchronised');
  }

  /**
   * Get a secret value
   */
  getSecret(key: Keys): string {
    return this.cache[key];
  }

  /**
   * Synchronisation interval ID
   */
  private synchroniseIntervalId: NodeJS.Timeout | null = null;

  /**
   * Start the synchronisation interval
   */
  startSynchroniseInterval(intervalMs: number): void {
    if (this.synchroniseIntervalId !== null) {
      clearInterval(this.synchroniseIntervalId);
      this.synchroniseIntervalId = null;
    }
    this.synchroniseIntervalId = setInterval(
      () => this.synchroniseServiceSecrets(),
      intervalMs,
    );
  }

  /**
   * Stop the synchronisation interval
   */
  stopSynchroniseInterval(): void {
    if (this.synchroniseIntervalId !== null) {
      clearInterval(this.synchroniseIntervalId);
      this.synchroniseIntervalId = null;
    }
  }
}
