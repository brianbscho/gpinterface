import { PrismaClient } from "@prisma/client";
import { nanoid } from "nanoid";
import { getProviderHashId } from "./provider";

const prisma = new PrismaClient();

async function main() {
  const providerHashId = await getProviderHashId("Cohere");
  const models = await Promise.all(
    [
      {
        hashId: nanoid(),
        name: "command-r-plus",
        inputPricePerMillion: 3,
        outputPricePerMillion: 15,
        isFree: false,
        isLoginRequired: true,
        isAvailable: true,
        providerHashId,
      },
      {
        hashId: nanoid(),
        name: "command-r",
        inputPricePerMillion: 0.5,
        outputPricePerMillion: 1.5,
        isFree: true,
        isLoginRequired: false,
        isAvailable: true,
        providerHashId,
      },
    ].map((model) =>
      prisma.model.create({ data: model, select: { hashId: true } })
    )
  );

  const configs = await Promise.all(
    [
      {
        hashId: nanoid(),
        name: "prompt_truncation",
        type: "string",
        description: `Dictates how the prompt will be constructed.

With prompt_truncation set to "AUTO", some elements from chat_history and documents will be dropped in an attempt to construct a prompt that fits within the model's context length limit. During this process the order of the documents and chat history will be changed and ranked by relevance.

With prompt_truncation set to "AUTO_PRESERVE_ORDER", some elements from chat_history and documents will be dropped in an attempt to construct a prompt that fits within the model's context length limit. During this process the order of the documents and chat history will be preserved as they are inputted into the API.

With prompt_truncation set to "OFF", no elements will be dropped. If the sum of the inputs exceeds the model's context length limit, a TooManyTokens error will be returned.`,
        default: "AUTO",
        options: {
          createMany: {
            data: [
              { hashId: nanoid(), value: "AUTO" },
              { hashId: nanoid(), value: "AUTO_PRESERVE_ORDER" },
              { hashId: nanoid(), value: "OFF" },
            ],
          },
        },
      },
      {
        hashId: nanoid(),
        name: "search_queries_only",
        type: "boolean",
        description:
          "When true, the response will only contain a list of generated search queries, but no search will take place, and no reply from the model to the user's message will be generated.",
        default: "false",
        options: {
          createMany: {
            data: [
              { hashId: nanoid(), value: "true" },
              { hashId: nanoid(), value: "false" },
            ],
          },
        },
      },
      {
        hashId: nanoid(),
        name: "documents",
        type: "object",
        description: `A list of relevant documents that the model can cite to generate a more accurate reply. Each document is a string-string dictionary.

Example:
[ { "title": "Tall penguins", "text": "Emperor penguins are the tallest." }, { "title": "Penguin habitats", "text": "Emperor penguins only live in Antarctica." }, ]

Keys and values from each document will be serialized to a string and passed to the model. The resulting generation will include citations that reference some of these documents.

Some suggested keys are "text", "author", and "date". For better generation quality, it is recommended to keep the total word count of the strings in the dictionary to under 300 words.

An id field (string) can be optionally supplied to identify the document in the citations. This field will not be passed to the model.

An _excludes field (array of strings) can be optionally supplied to omit some key-value pairs from being shown to the model. The omitted fields will still show up in the citation object. The "_excludes" field will not be passed to the model.`,
        default: "[]",
      },
      {
        hashId: nanoid(),
        name: "citation_quality",
        type: "string",
        description:
          'Dictates the approach taken to generating citations as part of the RAG flow by allowing the user to specify whether they want "accurate" results, "fast" results or no results.',
        default: "accurate",
        options: {
          createMany: {
            data: [
              { hashId: nanoid(), value: "accurate" },
              { hashId: nanoid(), value: "fast" },
            ],
          },
        },
      },
      {
        hashId: nanoid(),
        name: "temperature",
        type: "number",
        description: `A non-negative float that tunes the degree of randomness in generation. Lower temperatures mean less random generations, and higher temperatures mean more random generations.

Randomness can be further maximized by increasing the value of the p parameter.`,
        default: "0.3",
        min: 0,
        max: 1,
      },
      {
        hashId: nanoid(),
        name: "max_tokens",
        type: "integer",
        description:
          "The maximum number of tokens the model will generate as part of the response. Note: Setting a low value may result in incomplete generations.",
      },
      {
        hashId: nanoid(),
        name: "max_input_tokens",
        type: "integer",
        description: `The maximum number of input tokens to send to the model. If not specified, max_input_tokens is the model's context length limit minus a small buffer.

Input will be truncated according to the prompt_truncation parameter.`,
      },
      {
        hashId: nanoid(),
        name: "k",
        type: "integer",
        description: `Ensures only the top k most likely tokens are considered for generation at each step.
Defaults to 0, min value of 0, max value of 500.`,
        default: "0",
        min: 0,
        max: 500,
      },
      {
        hashId: nanoid(),
        name: "p",
        type: "number",
        description: `Ensures that only the most likely tokens, with total probability mass of p, are considered for generation at each step. If both k and p are enabled, p acts after k.
Defaults to 0.75. min value of 0.01, max value of 0.99.`,
        default: "0.75",
        min: 0.01,
        max: 0.09,
      },
      {
        hashId: nanoid(),
        name: "seed",
        type: "integer",
        description: `If specified, the backend will make a best effort to sample tokens
deterministically, such that repeated requests with the same
seed and parameters should return the same result. However,
determinism cannot be totally guaranteed.`,
        min: 0,
        max: 18446744073709552000,
      },
      {
        hashId: nanoid(),
        name: "stop_sequences",
        type: "array",
        description: `A list of up to 5 strings that the model will use to stop generation. If the model generates a string that matches any of the strings in the list, it will stop generating tokens and return the generated text up to that point not including the stop sequence.`,
      },
      {
        hashId: nanoid(),
        name: "frequency_penalty",
        type: "number",
        description: `Defaults to 0.0, min value of 0.0, max value of 1.0.

Used to reduce repetitiveness of generated tokens. The higher the value, the stronger a penalty is applied to previously present tokens, proportional to how many times they have already appeared in the prompt or prior generation.`,
        default: "0",
        min: 0,
        max: 1,
      },
      {
        hashId: nanoid(),
        name: "presence_penalty",
        type: "number",
        description: `Used to reduce repetitiveness of generated tokens. Similar to frequency_penalty, except that this penalty is applied equally to all tokens that have already appeared, regardless of their exact frequencies.
Compatible Deployments: Cohere Platform, Azure, AWS Sagemaker/Bedrock, Private Deployments`,
        default: "0",
        min: 0,
        max: 1,
      },
      {
        hashId: nanoid(),
        name: "force_single_step",
        type: "boolean",
        description: "Forces the chat to be single step. Defaults to false.",
        default: "false",
        options: {
          createMany: {
            data: [
              { hashId: nanoid(), value: "true" },
              { hashId: nanoid(), value: "false" },
            ],
          },
        },
      },
      {
        hashId: nanoid(),
        name: "response_format",
        type: "object",
        description: `Configuration for forcing the model output to adhere to the specified format. Supported on Command R, Command R+ and newer models.

The model can be forced into outputting JSON objects (with up to 5 levels of nesting) by setting { "type": "json_object" }.

A JSON Schema can optionally be provided, to ensure a specific structure.

Note: When using { "type": "json_object" } your message should always explicitly instruct the model to generate a JSON (eg: "Generate a JSON ...") . Otherwise the model may end up getting stuck generating an infinite stream of characters and eventually run out of context length.
Limitation: The parameter is not supported in RAG mode (when any of connectors, documents, tools, tool_results are provided).`,
        default: '{"type":"text"}',
      },
    ].map((config) =>
      prisma.config.create({
        data: config,
        select: { hashId: true },
      })
    )
  );

  for (const model of models) {
    for (const config of configs) {
      await prisma.configOnModel.create({
        data: {
          hashId: nanoid(),
          modelHashId: model.hashId,
          configHashId: config.hashId,
        },
      });
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    // @ts-ignore
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
