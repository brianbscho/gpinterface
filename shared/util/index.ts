export function getValidBody(content: string, body: any) {
  const regex = /{{(\S+)}}/g;
  let match: RegExpExecArray | null = null;

  const keys: string[] = [];
  while ((match = regex.exec(content)) !== null) {
    keys.push(match[1]);
  }

  for (const key of keys) {
    if (!(key in body) || !body[key]) {
      throw `${key} is missing`;
    }
  }

  return body;
}
