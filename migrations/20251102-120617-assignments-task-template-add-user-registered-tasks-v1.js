import { ObjectId } from 'mongodb';

// Specify the database this migration should run against
export const database = "assignments";

const completeRegistrationAssignment = 'complete-registration';

const enterYourNameTask = {
  _id: new ObjectId(),
  createdAt: new Date(),
  actions: [
    'profile.enter-first-name',
    'profile.enter-last-name',
  ],
  assignment: completeRegistrationAssignment,
  description: 'Add your first and last name to your profile.',
  label: 'Enter your name',
  reason: 'Your name helps us personalize your experience.',
  replaces: null,
}

const verifyEmailAddressTask = {
  _id: new ObjectId(),
  createdAt: new Date(),
  actions: [
    'profile.verify-email',
  ],
  assignment: completeRegistrationAssignment,
  description: 'Confirm your email address to secure your account.',
  label: 'Verify email address',
  reason: 'Verifying your email ensures that you have access to your account and can recover it if needed.',
  replaces: null,
}

/**
 * @param context
 */
export async function up({ db }) {
  await db.collection("task-templates").insertOne(enterYourNameTask);
  await db.collection("task-templates").insertOne(verifyEmailAddressTask);
}

/**
 * @param context
 */
export async function down({ db }) {
  await db.collection("task-templates").deleteOne({ _id: enterYourNameTask._id });
  await db.collection("task-templates").deleteOne({ _id: verifyEmailAddressTask._id });
}
