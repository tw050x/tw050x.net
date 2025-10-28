import { MessageAttributeValue, SendMessageCommand, SendMessageCommandInput } from "@aws-sdk/client-sqs";
import { sqsClient } from "./sqs-client.js";

/**
 * Body of the message being sent.
 */
interface SendMessageMessageBody extends Record<string, unknown> {}

/**
 * Attributes for the message being sent.
 */
interface SendMessageMessageAttributes extends Record<string, MessageAttributeValue> {
  MessageType: { DataType: 'String'; StringValue: string };
}

/**
 * Sends a message to an SQS queue.
 */
export const sendMessage = async (url: URL, messageBody: SendMessageMessageBody, messageAttributes: SendMessageMessageAttributes) => {
  const params: SendMessageCommandInput = {
    QueueUrl: url.toString(),
    MessageBody: JSON.stringify(messageBody),
    MessageAttributes: messageAttributes,
  };

  const command = new SendMessageCommand(params);
  const response = await sqsClient.send(command);
  return response;
}
