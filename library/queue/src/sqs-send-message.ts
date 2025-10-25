import { SendMessageCommand } from "@aws-sdk/client-sqs";
import { sqsClient } from "./sqs-client.js";

/**
 * Sends a message to an SQS queue.
 */
export const sendMessage = async (url: string, messageBody: Record<string, unknown>) => {
  const params = {
    QueueUrl: url,
    MessageBody: JSON.stringify(messageBody),
  };

  const command = new SendMessageCommand(params);
  const response = await sqsClient.send(command);
  return response;
}
