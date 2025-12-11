import { Document, Filter } from 'mongodb';

/**
 * A symbol used to mark trusted values in a MongoDB filter.
 */
export const trustedSymbol = Symbol('trusted');

/**
 * Marks an object as trusted for MongoDB queries.
 */
export const trusted = <T extends object>(object: T): T => {
  if (object == null || typeof object !== 'object') {
    return object;
  }
  (object as Record<typeof trustedSymbol, boolean>)[trustedSymbol] = true;
  return object;
}

/**
 * Determines if a value is marked as trusted.
 */
export const isTrusted = (value: unknown): value is { [trustedSymbol]: true } => {
  return typeof value === 'object' &&
    value !== null &&
    (value as Record<typeof trustedSymbol, boolean>)[trustedSymbol] === true;

}

/**
 * Checks if an object has any keys that start with a dollar sign ($).
 */
export const hasDollarKeys = (object: unknown) => {
  if (typeof object !== 'object' || object === null) {
    return false;
  }

  const keys = Object.keys(object);
  const len = keys.length;

  for (let i = 0; i < len; ++i) {
    if (keys[i][0] === '$') {
      return true;
    }
  }

  return false;
}

/**
 *
 */
export const sanitizeValue = (value: unknown): unknown => {
  if (value == null || typeof value !== 'object') {
    return value;
  }
  if (isTrusted(value)) {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  if (hasDollarKeys(value)) {
    const keys = Object.keys(value);
    if (keys.length === 1 && keys[0] === '$eq') {
      return value;
    }
    return { $eq: value };
  }

  const obj = value as Record<string, unknown>;
  for (const key of Object.keys(obj)) {
    obj[key] = sanitizeValue(obj[key]);
  }
  return obj;
};

/**
 * Sanitizes a MongoDB filter or aggregation pipeline
 *
 * @param filterOrPipeline
 * @returns
 */
export function sanitizeFilter<TSchema extends Document = Document>(filter: Filter<TSchema>): Filter<TSchema> {
  if (filter == null || typeof filter !== 'object') {
    return filter;
  }

  const mutable = filter as Record<string, unknown>;
  for (const key of Object.keys(mutable)) {
    const value = mutable[key];

    if (isTrusted(value)) {
      continue;
    }

    if (key === '$and' || key === '$or') {
      if (Array.isArray(value)) {
        mutable[key] = value.map((item) => sanitizeFilter(item as Filter<TSchema>));
      }
      continue;
    }

    mutable[key] = sanitizeValue(value);
  }

  return filter;
}

/**
 * Sanitize a MongoDB aggregation pipeline.
 */
export function sanitizePipeline(pipeline: Array<Document>): Array<Document> {
  return pipeline.map((stage) => {
    if (stage == null || typeof stage !== 'object') {
      return stage;
    }
    const mutable = stage as Record<string, unknown>;
    for (const key of Object.keys(mutable)) {
      const value = mutable[key];
      if (isTrusted(value)) {
        continue;
      }
      mutable[key] = sanitizeValue(value);
    }
    return stage;
  });
}
