
/**
 * Type guard to check if the domain is in the allowed list of domains
 * Returns true if the domain is a string and matches one of the allowed domains
 *
 * @param domain - The domain to check (can be any type)
 * @param allowedDomains - Array of allowed domain strings
 * @returns true if domain is a string and in the allowed list of domains
 */
const isAllowedDomain = <T extends readonly string[]>(domain: unknown, allowedDomains: T): domain is T[number] => {
  // Check if domain is a string type
  // Return false if not a string
  if (typeof domain !== 'string') {
    return false;
  }

  // Check if domain matches any allowed domains
  // Return true on first match found
  for (const allowedOriginDomain of allowedDomains) {
    if (typeof allowedOriginDomain !== 'string') continue;
    if (domain.startsWith(`https://${allowedOriginDomain}`)) {
      return true;
    }
  }
  return false;
}

export default isAllowedDomain;
