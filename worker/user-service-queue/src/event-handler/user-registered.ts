import { AssignmentTaskDocument, database as assignmentDatabase } from "@tw050x.net.database/assignment";
import { logger } from "@tw050x.net.library/logger";
import { isObjectId } from "@tw050x.net.library/utility/is-object-id";
import { ObjectId } from "mongodb";

/**
 * Handles a UserRegistered event message.
 *
 * @param messageBody - The message body for the UserRegistered event.
 */
export default async function handleUserRegisteredEvent(messageBody: Record<string, unknown>): Promise<void> {
  logger.debug('Handling UserRegistered message body:', messageBody);

  if (('userProfileId' in messageBody) === false) {
    return void logger.error(new Error('userProfileId is missing in UserRegistered event message body'));
  }

  if (isObjectId(messageBody.userProfileId) === false) {
    return void logger.error(new Error('userProfileId is not a valid ObjectId in UserRegistered event message body'));
  }

  if (('userProfileUuid' in messageBody) === false) {
    return void logger.error(new Error('userProfileUuid is missing in UserRegistered event message body'));
  }

  if (typeof messageBody.userProfileUuid !== 'string') {
    return void logger.error(new Error('userProfileUuid is not a string in UserRegistered event message body'));
  }

  const assignment = 'complete-registration';

  // Fetch the latest task templates for the assignment
  let taskTemplates;
  try {
    taskTemplates = await assignmentDatabase.taskTemplate.find({
      assignment,
      replaces: null
    }).toArray();
  }
  catch (error) {
    logger.debug('Error fetching task templates for assignment');
    return void logger.error(error);
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
      userProfileId: new ObjectId(messageBody.userProfileId),
      userProfileUuid: messageBody.userProfileUuid
    })
  }

  if (tasks.length === 0) {
    return void logger.debug(`No task templates found for assignment: ${assignment}, skipping task creation`);
  }

  try {
    await assignmentDatabase.task.insertMany(tasks);
  }
  catch (error) {
    logger.debug('Error inserting assignment tasks for user');
    return void logger.error(error);
  }

  logger.debug(`Created ${tasks.length} assignment tasks for userProfileId: ${messageBody.userProfileId}`);
}
