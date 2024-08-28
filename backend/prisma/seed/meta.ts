import { PrismaClient } from "@prisma/client";
import { nanoid } from "nanoid";
import { getProviderHashId } from "./provider";
import { providers } from "../../src/util/provider";

const prisma = new PrismaClient();

async function main() {
  const providerHashId = await getProviderHashId(providers.Meta);
  let models = await Promise.all(
    [
      {
        hashId: nanoid(),
        name: "meta.llama3-1-70b-instruct-v1:0",
        inputPricePerMillion: 2.65,
        outputPricePerMillion: 3.5,
        isFree: true,
        isLoginRequired: true,
        isAvailable: true,
        providerHashId,
      },
      {
        hashId: nanoid(),
        name: "meta.llama3-1-8b-instruct-v1:0",
        inputPricePerMillion: 0.3,
        outputPricePerMillion: 0.6,
        isFree: true,
        isLoginRequired: false,
        isAvailable: true,
        providerHashId,
      },
      {
        hashId: nanoid(),
        name: "meta.llama3-70b-instruct-v1:0",
        inputPricePerMillion: 2.65,
        outputPricePerMillion: 3.5,
        isFree: true,
        isLoginRequired: true,
        isAvailable: true,
        providerHashId,
      },
      {
        hashId: nanoid(),
        name: "meta.llama3-8b-instruct-v1:0",
        inputPricePerMillion: 0.3,
        outputPricePerMillion: 0.6,
        isFree: true,
        isLoginRequired: true,
        isAvailable: true,
        providerHashId,
      },
    ].map(async (model) => {
      const m = await prisma.model.findFirst({
        where: { name: model.name },
        select: { hashId: true },
      });
      if (m) {
        return { hashId: "" };
      }

      return prisma.model.create({ data: model, select: { hashId: true } });
    })
  );
  models = models.filter((m) => m.hashId.length > 0);

  const configs = await Promise.all(
    [
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
