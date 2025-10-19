import { AssignmentTaskDocument } from "@tw050x.net.database/assignment";

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
export const generateRegistrationAssignmentTasks = async ({ userProfileUuid }: GenerateRegistrationAssignmentTasksProperties): Promise<Array<AssignmentTaskDocument>> => {
  const tasks: Array<AssignmentTaskDocument> = []

  const assignment = 'complete-registration';
  const date = new Date();

  tasks.push({
    createdAt: date,
    updatedAt: date,
    assignment,
    assignedBy: 'system',
    completed: false,
    assignmentTaskTemplateUuid: process.env.ENTER_YOUR_NAME_TASK_TEMPLATE_UUID,
    userProfileUuid
  });

  tasks.push({
    createdAt: date,
    updatedAt: date,
    assignment,
    completed: false,
    assignedBy: 'system',
    assignmentTaskTemplateUuid: process.env.VERIFY_EMAIL_TASK_TEMPLATE_UUID,
    userProfileUuid
  });

  return tasks
}
