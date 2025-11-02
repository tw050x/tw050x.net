import { ObjectId } from "mongodb";

/**
 * Checks if a value is a valid MongoDB ObjectId.
 *
 * @param value - The value to check.
 * @returns True if the value is a valid ObjectId, false otherwise.
 */
export const isObjectId = (value: unknown): value is ObjectId => {
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    value instanceof ObjectId
  ) {
    return ObjectId.isValid(value);
  }

  return false;
};
