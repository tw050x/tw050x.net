import { AssignmentTaskDocument, database as assignmentDatabase } from "@tw050x.net.database/assignment";
import { logger } from "@tw050x.net.library/logger"

/**
 * Handles a UserRegistered event message.
 *
 * @param messageBody - The message body for the UserRegistered event.
 */
export default async function handleUserRegisteredEvent(messageBody: Record<string, unknown>): Promise<void> {
  logger.debug('Handling UserRegistered message body:', messageBody);

  if ('userProfileUuid' in messageBody === false) {
    return void logger.error(new Error('userProfileUuid is missing in UserRegistered event message body'));
  }
  if (typeof messageBody.userProfileUuid !== 'string') {
    return void logger.error(new Error('userProfileUuid is not a string in UserRegistered event message body'));
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
    userProfileUuid: messageBody.userProfileUuid
  });

  tasks.push({
    createdAt: date,
    updatedAt: date,
    assignment,
    completed: false,
    assignedBy: 'system',
    assignmentTaskTemplateUuid: process.env.VERIFY_EMAIL_TASK_TEMPLATE_UUID,
    userProfileUuid: messageBody.userProfileUuid
  });

  await assignmentDatabase.task.insertMany(tasks);
}
