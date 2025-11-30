import { ObjectId } from 'mongodb';

// Specify the database this migration should run against
export const database = "assignments";

const completeRegistrationAssignment = 'complete-registration';

const enterYourNameTaskObjectId = new ObjectId('656f1c29f1e4f0001a2b3c4d');
const enterYourNameTask = {
  _id: enterYourNameTaskObjectId,
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

const verifyEmailAddressTaskObjectId = new ObjectId('656f1c29f1e4f0001a2b3c4e');
const verifyEmailAddressTask = {
  _id: verifyEmailAddressTaskObjectId,
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
  await db.collection("task-templates").deleteOne({ _id: enterYourNameTaskObjectId });
  await db.collection("task-templates").deleteOne({ _id: verifyEmailAddressTaskObjectId });
}
