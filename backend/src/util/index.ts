export function getValidBody(body: any, keys: string[]) {
  for (const key of keys) {
    if (!(key in body)) {
      throw `${key} is missing`;
    }
  }

  return body;
}
