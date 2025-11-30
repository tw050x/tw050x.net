import { AssignmentTaskDocument, database as assignmentDatabase } from "@tw050x.net.database/assignment";
import { logger } from "@tw050x.net.library/logger";

/**
 * Handles a UserRegistered event message.
 *
 * @param messageBody - The message body for the UserRegistered event.
 */
export default async function handleUserRegisteredEvent(messageBody: Record<string, unknown>): Promise<void> {
  logger.debug('Handling UserRegistered message');

  if (('userProfileUuid' in messageBody) === false) {
    throw new Error('userProfileUuid is missing in UserRegistered event message body');
  }

  if (typeof messageBody.userProfileUuid !== 'string') {
    throw new Error('userProfileUuid is not a string in UserRegistered event message body');
  }

  const assignment = 'complete-registration';

  // Fetch the latest task templates for the assignment
  let taskTemplates
  try {
    taskTemplates = await assignmentDatabase.taskTemplate.find({
      assignment,
      replaces: null
    }).toArray();
  }
  catch (error) {
    logger.error(`Failed to fetch task templates for assignment: ${assignment}`, { error });
    throw new Error(`Failed to fetch task templates for assignment: ${assignment}`);
  }
  logger.debug(`Fetched ${taskTemplates.length} task templates for assignment: ${assignment}`);

  const date = new Date();
  const tasks: Array<AssignmentTaskDocument> = [];

  for (const template of taskTemplates) {
    tasks.push({
      assignment,
      assignedBy: 'system',
      actions: template.actions,
      completed: false,
      createdAt: date,
      description: template.description,
      label: template.label,
      reason: template.reason,
      userProfileUuid: messageBody.userProfileUuid
    })
  }

  if (tasks.length === 0) {
    throw new Error(`No task templates found for assignment: ${assignment}, skipping task creation`);
  }

  await assignmentDatabase.task.insertMany(tasks);

  logger.debug(`Created ${tasks.length} assignment tasks for userProfileId: ${messageBody.userProfileId}`);
}
