
/**
 * Represents a secret stored in AWS Secrets Manager.
 */
export type Secret = {
  key: string;
  source: 'secrets-manager';
  type: 'secret';
};
