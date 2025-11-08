import { GetParametersCommand } from "@aws-sdk/client-ssm";
import { logger } from "@tw050x.net.library/logger";
import { EventEmitter } from "node:events";
import { ssmClient } from "./client.js";

/**
 * Service Parameters class
 */
export default class ServiceParameters<Keys extends string> {

  /**
   * Parameter cache
   */
  private cache: Record<Keys, string> = {} as Record<Keys, string>;

  /**
   * Event emitter for parameter events
   */
  private eventEmitter = new EventEmitter();

  /**
   * Whether the parameters have been initialised
   */
  private firstSynchronisedPromise: Promise<boolean>;

  /**
   * Whether the parameters have been initialised
   */
  public hasSynchronised(): Promise<boolean> {
    return this.firstSynchronisedPromise;
  }

  /**
   * Whether to decrypt the parameter values
   */
  private withDecryption: boolean;

  /**
   * Constructor
   */
  constructor(parameters: Array<Keys>, withDecryption: boolean = false) {

    // Initialise the cache
    for (const parameter of parameters) {
      this.cache[parameter] = '<uninitialised>';
    }

    // Set decryption flag
    this.withDecryption = withDecryption;

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
   * Synchronise service parameters from SSM
   */
  async synchroniseServiceParameters(): Promise<void> {
    logger.debug('Synchronising service parameters');

    // Abort any existing in progress synchronisation
    if (this.abortController !== null) {
      this.abortController.abort();
      this.abortController = null;
    }

    const keys = Object.keys(this.cache) as Keys[];
    if (keys.length === 0) {
      logger.debug('No service parameters to synchronise');
      return void this.eventEmitter.emit('initialised', true);
    }

    const sendCommandPromises = [];
    for (let index = 0; index < keys.length; index += 10) {
      const chunk = keys.slice(index, index + 10);
      const command = new GetParametersCommand({
        Names: chunk,
        WithDecryption: this.withDecryption
      });
      this.abortController = new AbortController();
      try {
        sendCommandPromises.push(
          ssmClient.send(command, {
            abortSignal: this.abortController.signal
          })
        );
      }
      catch (error) {
        logger.error(error);
        logger.debug('Failed to synchronise service parameters');
        return void this.eventEmitter.emit('initialised', false);
      }
    }

    await Promise.all(sendCommandPromises).then((responses) => {
      for (const response of responses) {
        for (const parameter of response.Parameters ?? []) {
          if (parameter.Name && parameter.Value) {
            this.cache[parameter.Name as Keys] = parameter.Value;
          }
        }
      }
    })

    this.eventEmitter.emit('initialised', true);
    logger.debug('Service parameters synchronised');
  }

  /**
   * Get a parameter value
   */
  getParameter(key: Keys): string {
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
      () => this.synchroniseServiceParameters(),
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
