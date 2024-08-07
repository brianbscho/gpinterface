export const stringify = (obj: object) =>
  JSON.stringify(obj, null, "\t").replace(/\\n/g, "\n");

export function getKeys(content: string) {
  const regex = /{{(\S+)}}/g;
  let match: RegExpExecArray | null = null;

  const keys: string[] = [];
  while ((match = regex.exec(content)) !== null) {
    keys.push(match[1]);
  }

  return keys;
}

type Input = { name: string; value: string };
export function getKeyAlignedInput(keys: string[], inputs: Input[]) {
  const newInputs = [...inputs].filter((i) => keys.includes(i.name));
  const newInputsKeys = newInputs.map((i) => i.name);
  keys.forEach((k) => {
    if (!newInputsKeys.includes(k)) {
      newInputs.push({ name: k, value: "" });
    }
  });

  return newInputs;
}

export const objectToInputs = (obj: object) => {
  return Object.keys(obj).map((k) => ({
    name: k,
    value: obj[k as keyof typeof obj] as string,
  }));
};

export const inputsToObject = (inputs: Input[]) => {
  return inputs.reduce((acc: { [key: string]: string }, curr) => {
    acc[curr.name] = curr.value;
    return acc;
  }, {});
};

export const getHighlightedPrompt = (prompt: string, body: any) => {
  let interpolatedString = prompt;
  Object.keys(body).forEach((key) => {
    interpolatedString = interpolatedString.replaceAll(
      `{{${key}}}`,
      `{{${body[key]}}}`
    );
  });

  const regex = /{{([\s\S]*?)}}/g;
  const output = interpolatedString.replace(
    regex,
    '<span class="bg-primary text-primary-foreground">$1</span>'
  );
  return output;
};
