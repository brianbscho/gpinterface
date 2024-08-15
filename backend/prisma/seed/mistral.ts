import { PrismaClient } from "@prisma/client";
import { nanoid } from "nanoid";
import { getProviderHashId } from "./provider";
import { providers } from "../../src/util/provider";

const prisma = new PrismaClient();

async function main() {
  const providerHashId = await getProviderHashId(providers.MistralAI);
  const models = await Promise.all(
    [
      {
        hashId: nanoid(),
        name: "open-mistral-nemo-2407",
        inputPricePerMillion: 0.3,
        outputPricePerMillion: 0.3,
        isFree: true,
        isLoginRequired: true,
        isAvailable: true,
        providerHashId,
      },
      {
        hashId: nanoid(),
        name: "open-mixtral-8x22b-2404",
        inputPricePerMillion: 2,
        outputPricePerMillion: 6,
        isFree: true,
        isLoginRequired: true,
        isAvailable: true,
        providerHashId,
      },
      {
        hashId: nanoid(),
        name: "mistral-large-2407",
        inputPricePerMillion: 3,
        outputPricePerMillion: 9,
        isFree: false,
        isLoginRequired: true,
        isAvailable: true,
        providerHashId,
      },
      {
        hashId: nanoid(),
        name: "mistral-medium-2312",
        inputPricePerMillion: 2.75,
        outputPricePerMillion: 8.1,
        isFree: false,
        isLoginRequired: true,
        isAvailable: true,
        providerHashId,
      },
      {
        hashId: nanoid(),
        name: "mistral-small-2402",
        inputPricePerMillion: 1,
        outputPricePerMillion: 3,
        isFree: true,
        isLoginRequired: true,
        isAvailable: true,
        providerHashId,
      },
      {
        hashId: nanoid(),
        name: "mistral-small-2312",
        inputPricePerMillion: 0.7,
        outputPricePerMillion: 0.7,
        isFree: true,
        isLoginRequired: true,
        isAvailable: true,
        providerHashId,
      },
      {
        hashId: nanoid(),
        name: "mistral-tiny-2312",
        inputPricePerMillion: 0.25,
        outputPricePerMillion: 0.25,
        isFree: true,
        isLoginRequired: false,
        isAvailable: true,
        providerHashId,
      },
      {
        hashId: nanoid(),
        name: "codestral-2405",
        inputPricePerMillion: 1,
        outputPricePerMillion: 3,
        isFree: true,
        isLoginRequired: true,
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
        name: "temperature",
        type: "number",
        description:
          "What sampling temperature to use, between 0.0 and 1.0. Higher values like 0.8 will make the output more random, while lower values like 0.2 will make it more focused and deterministic. We generally recommend altering this or top_p but not both.",
        default: "0.7",
        min: 0,
        max: 1,
      },
      {
        hashId: nanoid(),
        name: "top_p",
        type: "number",
        description:
          "Nucleus sampling, where the model considers the results of the tokens with top_p probability mass. So 0.1 means only the tokens comprising the top 10% probability mass are considered. We generally recommend altering this or temperature but not both.",
        default: "1",
        min: 0,
        max: 1,
      },
      {
        hashId: nanoid(),
        name: "max_tokens",
        type: "integer",
        description:
          "The maximum number of tokens to generate in the completion. The token count of your prompt plus max_tokens cannot exceed the model's context length.",
      },
      {
        hashId: nanoid(),
        name: "min_tokens",
        type: "integer",
        description:
          "The minimum number of tokens to generate in the completion.",
      },
      {
        hashId: nanoid(),
        name: "stop",
        type: "array",
        description:
          "Stop generation if this token is detected. Or if one of these tokens is detected when providing an array",
      },
      {
        hashId: nanoid(),
        name: "random_seed",
        type: "integer",
        description:
          "The seed to use for random sampling. If set, different calls will generate deterministic results.",
      },
      {
        hashId: nanoid(),
        name: "response_format",
        type: "object",
        description:
          'An object specifying the format that the model must output. Setting to { "type": "json_object" } enables JSON mode, which guarantees the message the model generates is in JSON. When using JSON mode you MUST also instruct the model to produce JSON yourself with a system or a user message.',
        default: '{"type":"text"}',
      },
      {
        hashId: nanoid(),
        name: "safe_prompt",
        type: "array",
        description:
          "Up to 4 sequences where the API will stop generating further tokens",
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
