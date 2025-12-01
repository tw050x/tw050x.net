
/**
 * Normalises an email address by trimming whitespace and converting it to lowercase.
 * Additionally removes any '+' tags from the local part of the email.
 *
 * @param email - The email address to normalise.
 * @returns The normalised email address.
 *
 * @example
 *
 * Remove leading/trailing whitespace and convert to lowercase:
 * ```ts
 * const email = "   EXAMPLE@DOMAIN.COM   ";
 * const normalised = normaliseEmailAddress(email);
 * console.log(normalised); // "example@domain.com"
 * ```
 *
 * Removes the +1 from user+1@mail.com
 * ```ts
 * const email = "user+1@mail.com";
 * const normalised = normaliseEmailAddress(email);
 * console.log(normalised); // "user@mail.com"
 * ```
 */
export const normaliseEmailAddress = (email: string): string => {
  return email.trim().toLowerCase().replace(/\+.*@/, '@');
};
