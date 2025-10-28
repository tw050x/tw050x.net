import { logger } from "@tw050x.net.library/logger";
import { DeleteMessageCommand, ReceiveMessageCommand, ReceiveMessageCommandInput } from "@aws-sdk/client-sqs";
import { sqsClient } from "./sqs-client.js";

/**
 * Receives messages from an SQS queue.
 */
export async function* receiveMessages(url: string, maxNumberOfMessages = 10) {
  while (true) {
    const params: ReceiveMessageCommandInput = {
      QueueUrl: url,
      MaxNumberOfMessages: maxNumberOfMessages,
      MessageAttributeNames: ['All'],
      WaitTimeSeconds: 20,
    };

    const command = new ReceiveMessageCommand(params);
    const response = await sqsClient.send(command);

    if (response.Messages && response.Messages.length > 0) {
      for (const message of response.Messages) {
        const deleteMessage = async () => {
          if (message.ReceiptHandle) {
            return void logger.error(`No ReceiptHandle found for message with id ${message.MessageId}, cannot delete.`);
          }
          const debugCommand = new DeleteMessageCommand({
            QueueUrl: url,
            ReceiptHandle: message.ReceiptHandle
          });
          await sqsClient.send(debugCommand);
        }
        yield {
          deleteMessage,
          message,
        };
      }
    }
  }
}
