import { AssignmentTaskDocument, database as assignmentDatabase } from "@tw050x.net.database/assignment";
import { logger } from "@tw050x.net.library/logger";
import { isObjectId } from "@tw050x.net.library/utility/is-object-id";

/**
 * Handles a UserRegistered event message.
 *
 * @param messageBody - The message body for the UserRegistered event.
 */
export default async function handleUserRegisteredEvent(messageBody: Record<string, unknown>): Promise<void> {
  logger.debug('Handling UserRegistered message body:', messageBody);

  if ('userProfileId' in messageBody === false) {
    return void logger.error(new Error('userProfileId is missing in UserRegistered event message body'));
  }
  if (isObjectId(messageBody.userProfileId) === false) {
    return void logger.error(new Error('userProfileId is not a valid ObjectId in UserRegistered event message body'));
  }

  let tasks: Array<AssignmentTaskDocument> = [];

  const assignment = 'complete-registration';
  const date = new Date();

  tasks.push({
    createdAt: date,
    updatedAt: date,
    assignment,
    assignedBy: 'system',
    completed: false,
    assignmentTaskTemplateUuid: process.env.ENTER_YOUR_NAME_TASK_TEMPLATE_UUID,
    userProfileId: messageBody.userProfileId
  });

  tasks.push({
    createdAt: date,
    updatedAt: date,
    assignment,
    completed: false,
    assignedBy: 'system',
    assignmentTaskTemplateUuid: process.env.VERIFY_EMAIL_TASK_TEMPLATE_UUID,
    userProfileId: messageBody.userProfileId
  });

  await assignmentDatabase.task.insertMany(tasks);
}
