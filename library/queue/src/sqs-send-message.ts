import { MessageAttributeValue, SendMessageCommand, SendMessageCommandInput } from "@aws-sdk/client-sqs";
import { sqsClient } from "./sqs-client.js";

/**
 * Attributes for the message being sent.
 */
interface SendMessageAttributes extends Record<string, MessageAttributeValue> {
  MessageType: { DataType: 'String'; StringValue: string };
}

/**
 * Sends a message to an SQS queue.
 */
export const sendMessage = async (url: string, messageBody: Record<string, unknown>, messageAttributes: SendMessageAttributes) => {
  const params: SendMessageCommandInput = {
    QueueUrl: url,
    MessageBody: JSON.stringify(messageBody),
    MessageAttributes: messageAttributes,
  };

  const command = new SendMessageCommand(params);
  const response = await sqsClient.send(command);
  return response;
}
