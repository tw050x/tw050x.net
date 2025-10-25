import { ReceiveMessageCommand } from "@aws-sdk/client-sqs";
import { sqsClient } from "./sqs-client.js";

/**
 * Receives messages from an SQS queue.
 */
export async function* receiveMessages(url: string, maxNumberOfMessages = 10) {
  while (true) {
    const params = {
      QueueUrl: url,
      MaxNumberOfMessages: maxNumberOfMessages,
      WaitTimeSeconds: 20,
    };

    const command = new ReceiveMessageCommand(params);
    const response = await sqsClient.send(command);

    if (response.Messages && response.Messages.length > 0) {
      for (const message of response.Messages) {
        yield message;
      }
    }
  }
}
