import { PrismaClient } from "@prisma/client";
import ai21LabsSeed from "./ai21_labs";
import anthropicSeed from "./anthropic";
import cohereSeed from "./cohere";
import metaSeed from "./meta";
import mistralSeed from "./mistral";
import openaiSeed from "./openai";
import geminiSeed from "./gemini";
import { Provider } from "../../src/util/provider";
import { getProviderHashId } from "./provider";
import { nanoid } from "nanoid";

const prisma = new PrismaClient();

async function main() {
  const providers = [
    { provider: Provider.AI21Labs, ...ai21LabsSeed },
    { provider: Provider.Anthropic, ...anthropicSeed },
    { provider: Provider.Cohere, ...cohereSeed },
    { provider: Provider.Meta, ...metaSeed },
    { provider: Provider.MistralAI, ...mistralSeed },
    { provider: Provider.OpenAI, ...openaiSeed },
    { provider: Provider.Gemini, ...geminiSeed },
  ];

  for (const provider of providers) {
    const providerHashId = await getProviderHashId(provider.provider);
    let models = await Promise.all(
      provider.models.map(async (model) => {
        const m = await prisma.model.findFirst({
          where: { name: model.name },
          select: { hashId: true },
        });
        if (m) {
          return { hashId: "" };
        }

        return prisma.model.create({
          data: { providerHashId, ...model },
          select: { hashId: true },
        });
      })
    );
    models = models.filter((m) => m.hashId.length > 0);

    const configs = await Promise.all(
      provider.configs.map((config) =>
        prisma.config.create({ data: config, select: { hashId: true } })
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
