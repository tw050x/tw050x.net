
/**
 * Represents a parameter stored in AWS Systems Manager Parameter Store.
 */
export type Parameter = {
  key: string;
  source: 'ssm';
  type: 'parameter';
};
