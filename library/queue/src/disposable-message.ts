import { logger } from "@tw050x.net.library/logger"
import { DeleteMessageCommand, Message } from "@aws-sdk/client-sqs";
import { sqsClient } from "./sqs-client.js";

/**
 * A disposable wrapper around an SQS message.
 */
export default class DisposableMessage implements Message {

  /**
   * The attributes associated with the message.
   */
  Attributes?: Record<string, string>;

  /**
   * The body of the message.
   */
  Body?: string;

  /**
   * The MD5 digest of the message's body.
   */
  MD5OfBody?: string;

  /**
   * The MD5 digest of the message's attributes.
   */
  MessageId?: string;

  /**
   * The MD5 digest of the message's attributes.
   */
  MD5OfMessageAttributes?: string;

  /**
   * The receipt handle associated with the message.
   */
  MessageAttributes?: Message['MessageAttributes'];

  /**
   * The receipt handle associated with the message.
   */
  ReceiptHandle?: string;

  /**
   * The URL of the SQS queue from which the message was received.
   */
  private queueUrl: string;

  /**
   * Constructs a new DisposableMessage.
   *
   * @param message
   * @param queueUrl
   */
  constructor(message: Message, queueUrl: string) {
    this.MessageId = message.MessageId;
    this.ReceiptHandle = message.ReceiptHandle;
    this.MD5OfBody = message.MD5OfBody;
    this.Body = message.Body;
    this.Attributes = message.Attributes;
    this.MD5OfMessageAttributes = message.MD5OfMessageAttributes;
    this.MessageAttributes = message.MessageAttributes;
    this.queueUrl = queueUrl;
  }

  /**
   * Dispose method to delete the message from the queue.
   * Called automatically when used with `using` statement.
   */
  async [Symbol.asyncDispose]() {
    if (this.ReceiptHandle === undefined) {
      return void logger.error('Cannot delete message without ReceiptHandle');
    }
    const deleteCommand = new DeleteMessageCommand({
      QueueUrl: this.queueUrl,
      ReceiptHandle: this.ReceiptHandle,
    });
    try {
      await sqsClient.send(deleteCommand)
    }
    catch (error) {
      logger.error('Error deleting message from SQS queue:', error);
    }
  }
}
