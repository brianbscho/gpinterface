import { nanoid } from "nanoid";

const models = [
  {
    hashId: nanoid(),
    name: "gemini-1.5-flash",
    inputPricePerMillion: 0.15,
    outputPricePerMillion: 0.6,
    isFree: true,
    isLoginRequired: false,
    isAvailable: true,
  },
  {
    hashId: nanoid(),
    name: "gemini-1.5-pro",
    inputPricePerMillion: 7,
    outputPricePerMillion: 21,
    isFree: false,
    isLoginRequired: true,
    isAvailable: true,
  },
  {
    hashId: nanoid(),
    name: "gemini-1.0-pro",
    inputPricePerMillion: 0.5,
    outputPricePerMillion: 1.5,
    isFree: true,
    isLoginRequired: true,
    isAvailable: true,
  },
];

const configs = [
  {
    hashId: nanoid(),
    name: "stopSequences",
    type: "array",
    description:
      "The set of character sequences (up to 5) that will stop output generation. If specified, the API will stop at the first appearance of a stop_sequence. The stop sequence will not be included as part of the response.",
  },
  {
    hashId: nanoid(),
    name: "maxOutputTokens",
    type: "integer",
    description:
      "The maximum number of tokens to include in a response candidate.",
  },
  {
    hashId: nanoid(),
    name: "temperature",
    type: "number",
    description: "Controls the randomness of the output.",
    default: "1",
    min: 0,
    max: 2,
  },
  {
    hashId: nanoid(),
    name: "topP",
    type: "number",
    description: `The maximum cumulative probability of tokens to consider when sampling.

The model uses combined Top-k and Top-p (nucleus) sampling.

Tokens are sorted based on their assigned probabilities so that only the most likely tokens are considered. Top-k sampling directly limits the maximum number of tokens to consider, while Nucleus sampling limits the number of tokens based on the cumulative probability.`,
  },
  {
    hashId: nanoid(),
    name: "topK",
    type: "integer",
    description: `The maximum number of tokens to consider when sampling.

Gemini models use Top-p (nucleus) sampling or a combination of Top-k and nucleus sampling. Top-k sampling considers the set of topK most probable tokens. Models running with nucleus sampling don't allow topK setting.`,
  },
];

export default { models, configs };
