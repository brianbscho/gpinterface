export const stringify = (obj: object) => JSON.stringify(obj, null, "\t");

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
