import { nanoid } from "nanoid";

const models = [
  {
    hashId: nanoid(),
    name: "meta.llama3-1-70b-instruct-v1:0",
    inputPricePerMillion: 2.65,
    outputPricePerMillion: 3.5,
    isFree: true,
    isLoginRequired: true,
    isAvailable: true,
  },
  {
    hashId: nanoid(),
    name: "meta.llama3-1-8b-instruct-v1:0",
    inputPricePerMillion: 0.3,
    outputPricePerMillion: 0.6,
    isFree: true,
    isLoginRequired: false,
    isAvailable: true,
  },
  {
    hashId: nanoid(),
    name: "meta.llama3-70b-instruct-v1:0",
    inputPricePerMillion: 2.65,
    outputPricePerMillion: 3.5,
    isFree: true,
    isLoginRequired: true,
    isAvailable: true,
  },
  {
    hashId: nanoid(),
    name: "meta.llama3-8b-instruct-v1:0",
    inputPricePerMillion: 0.3,
    outputPricePerMillion: 0.6,
    isFree: true,
    isLoginRequired: true,
    isAvailable: true,
  },
];

const configs = [
  {
    hashId: nanoid(),
    name: "maxTokens",
    type: "integer",
    description:
      "The maximum number of tokens to allow in the generated response. The default value is the maximum allowed value for the model that you are using.",
    default: "512",
    min: 1,
    max: 2048,
  },
  {
    hashId: nanoid(),
    name: "stopSequences",
    type: "array",
    description:
      "A list of stop sequences. A stop sequence is a sequence of characters that causes the model to stop generating the response.",
  },
  {
    hashId: nanoid(),
    name: "temperature",
    type: "number",
    description:
      "The likelihood of the model selecting higher-probability options while generating a response. A lower value makes the model more likely to choose higher-probability options, while a higher value makes the model more likely to choose lower-probability options.",
    default: "0.5",
    min: 0,
    max: 1,
  },
  {
    hashId: nanoid(),
    name: "topP",
    type: "number",
    description:
      "The percentage of most-likely candidates that the model considers for the next token. For example, if you choose a value of 0.8 for topP, the model selects from the top 80% of the probability distribution of tokens that could be next in the sequence.",
    default: "0.9",
    min: 0,
    max: 1,
  },
];

export default { models, configs };
