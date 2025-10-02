import { TaskDocument } from "@tw050x.net.database/assignment";

/**
 *
 */
type GenerateRegistrationAssignmentTasksProperties = {
  userProfileUuid: string;
}

/**
 * Generates initial registration tasks for a new user.
 *
 * @return {Array<Task>} An array of tasks for the new user.
 */
export const generateRegistrationAssignmentTasks = async ({ userProfileUuid }: GenerateRegistrationAssignmentTasksProperties): Promise<Array<TaskDocument>> => {
  const tasks: Array<TaskDocument> = []

  const assignment = 'complete-registration';
  const date = new Date();

  tasks.push({
    createdAt: date,
    updatedAt: date,
    assignment,
    assignedBy: 'system',
    completed: false,
    taskTemplateUuid: process.env.ENTER_YOUR_NAME_TASK_TEMPLATE_UUID,
    userProfileUuid
  });

  tasks.push({
    createdAt: date,
    updatedAt: date,
    assignment,
    completed: false,
    assignedBy: 'system',
    taskTemplateUuid: process.env.VERIFY_EMAIL_TASK_TEMPLATE_UUID,
    userProfileUuid
  });

  return tasks
}
