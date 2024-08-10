import { PrismaClient } from "@prisma/client";
import { nanoid } from "nanoid";
import { getProviderHashId } from "./provider";

const prisma = new PrismaClient();

async function main() {
  const providerHashId = await getProviderHashId("AI21 Labs");
  const models = await Promise.all(
    [
      {
        hashId: nanoid(),
        name: "jamba-instruct-preview",
        inputPricePerMillion: 0.5,
        outputPricePerMillion: 0.7,
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
        default: "1",
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
