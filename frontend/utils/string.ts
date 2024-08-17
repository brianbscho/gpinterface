export const stringify = (obj: object) =>
  JSON.stringify(obj, null, "\t").replace(/\\n/g, "\n");
