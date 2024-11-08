import { nanoid } from "nanoid";

const models = [
  {
    hashId: nanoid(),
    name: "jamba-instruct-preview",
    inputPricePerMillion: 0.5,
    outputPricePerMillion: 0.7,
    isFree: true,
    isLoginRequired: false,
    isAvailable: false,
  },
  {
    hashId: nanoid(),
    name: "jamba-1.5-mini",
    inputPricePerMillion: 0.2,
    outputPricePerMillion: 0.4,
    isFree: true,
    isLoginRequired: true,
    isAvailable: true,
  },
  {
    hashId: nanoid(),
    name: "jamba-1.5-large",
    inputPricePerMillion: 2,
    outputPricePerMillion: 8,
    isFree: false,
    isLoginRequired: true,
    isAvailable: true,
  },
];

const configs = [
  {
    hashId: nanoid(),
    name: "response_format",
    type: "object",
    description:
      'If left blank, will be text. if set to {"type":"json_object"} it will try to return the entire response in valid JSON format. For JSON formatting to succeed, you must have a description of the desired format in the prompt.',
  },
  {
    hashId: nanoid(),
    name: "documents",
    type: "object",
    description: `If present, provides extra context for the answers. You can also provide this information directly in the message content. Providing it here instead provides several benefits: 1) You can tell the model to generate its answer entirely based on the provided documents similar to a RAG engine. If you need this, you must specify so in the prompt ("Limit your answer to the information included in the attached documents."). 2) You can provide arbitrary metadata about each document, which might be useful for generating a response. Each document has the following elements:
- content [string, required] The content of this "document".
- metadata: [array of objects, optional] Arbitrary key/value metadata pairs describing this document:
\t-- key (required; str) - type of metadata, like 'author', 'date', 'url', etc. Should be things the model understands.
\t-- value (required; str) - value of the metadata`,
    default: "[]",
  },
  {
    hashId: nanoid(),
    name: "max_tokens",
    type: "integer",
    description:
      'The maximum number of tokens to allow for each generated response message. Typically the best way to limit output length is by providing a length limit in the system prompt (for example, "limit your answers to three sentences")',
    default: "4096",
    min: 0,
    max: 4096,
  },
  {
    hashId: nanoid(),
    name: "temperature",
    type: "number",
    description:
      "How much variation to provide in each answer. Setting this value to 0 guarantees the same response to the same question every time. Setting a higher value encourages more variation. Modifies the distribution from which tokens are sampled.",
    default: "0.4",
    min: 0,
    max: 2,
  },
  {
    hashId: nanoid(),
    name: "top_p",
    type: "number",
    description:
      "Limit the pool of next tokens in each step to the top N percentile of possible tokens, where 1.0 means the pool of all possible tokens, and 0.01 means the pool of only the most likely next tokens.",
    default: "1",
    min: 0,
    max: 1,
  },
  {
    hashId: nanoid(),
    name: "stop",
    type: "array",
    description: `End the message when the model generates one of these strings. The stop sequence is not included in the generated message. Each sequence can be up to 64K long, and can contain newlines as \n characters. Examples:
Single stop string with a word and a period: "monkeys."
Multiple stop strings and a newline: ["cat", "dog", " .", "####", "\n"]
`,
  },
];

export default { models, configs };
