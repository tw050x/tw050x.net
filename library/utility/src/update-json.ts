
/**
 * Updates a JSON object by setting a value at a specified dot path.
 *
 * @param jsonString - The original JSON string.
 * @param dotPath - The dot path where the value should be set (e.g., "menu.open").
 * @param value - The value to set at the specified dot path.
 */
export function updateJSON(jsonString: string, dotPath: string, value: any): string {
  const jsonObject = JSON.parse(jsonString || '{}');

  const keys = dotPath.split('.');
  let focus = jsonObject;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in focus) || typeof focus[key] !== 'object') {
      focus[key] = {};
    }
    focus = focus[key];
  }

  focus[keys[keys.length - 1]] = value;

  return JSON.stringify(jsonObject);
}
