import { AssignmentTaskDocument, database as assignmentDatabase } from "@tw050x.net.library/database/collections/assignment";
import { logger } from "@tw050x.net.library/platform/helper/logger";
import { z } from "zod";

//
const messageBodySchema = z.object({
  userProfileUuid: z.string(),
})

/**
 * Handles a UserRegistered event message.
 *
 * @param messageBody - The message body for the UserRegistered event.
 */
export default async function handleUserRegisteredEvent(messageBody: Record<string, unknown>): Promise<void> {
  logger.debug('Handling UserRegistered message');

  let userProfileUuid;
  try {
    const result = messageBodySchema.parse(messageBody);
    userProfileUuid = result.userProfileUuid;
  }
  catch (error) {
    logger.error(error);
    logger.debug('Invalid UserRegistered message body', { messageBody });
    throw new Error('Invalid UserRegistered message body');
  }

  const assignment = 'complete-registration';

  // Fetch the latest task templates for the assignment
  let taskTemplates
  try {
    taskTemplates = await assignmentDatabase.tasksTemplates.find({
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
      userProfileUuid,
    })
  }

  if (tasks.length === 0) {
    throw new Error(`No task templates found for assignment: ${assignment}, skipping task creation`);
  }

  await assignmentDatabase.tasks.insertMany(tasks);

  logger.debug(`Created ${tasks.length} assignment tasks for userProfileId: ${messageBody.userProfileId}`);
}
