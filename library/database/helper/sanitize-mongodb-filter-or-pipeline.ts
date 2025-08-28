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
 * Sanitizes a MongoDB filter or aggregation pipeline
 *
 * @param filterOrPipeline
 * @returns
 */
function sanitizeMongoDBFilterOrPipeline (filterOrPipeline: Filter<any>): Filter<any>;
function sanitizeMongoDBFilterOrPipeline (filterOrPipeline: Array<Document>): Array<Document>;
function sanitizeMongoDBFilterOrPipeline (filterOrPipeline: Filter<any> | Array<Document>): Filter<any> | Array<Document> {

  // return early if the filter is null or not an object
  // useful for recursive calls
  if (filterOrPipeline == null || typeof filterOrPipeline !== 'object') {
    return filterOrPipeline;
  }

  // recurse if the filter is an array
  if (Array.isArray(filterOrPipeline)) {
    return filterOrPipeline.map((stage) => sanitizeMongoDBFilterOrPipeline(stage) as Document);
  }

  // loop through the keys of the filter and sanitize them
  const filterKeys = Object.keys(filterOrPipeline);
  for (const key of filterKeys) {
    const value: any = filterOrPipeline[key];
    if (value != null && value[trustedSymbol] === true) {
      continue;
    }
    if (key === '$and' || key === '$or') {
      sanitizeMongoDBFilterOrPipeline(value);
      continue;
    }

    if (hasDollarKeys(value)) {
      const keys = Object.keys(value);
      if (keys.length === 1 && keys[0] === '$eq') {
        continue;
      }
      filterOrPipeline[key] = { $eq: filterOrPipeline[key] };
    }
  }

  return filterOrPipeline;
};

export default sanitizeMongoDBFilterOrPipeline;
