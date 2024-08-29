import { PrismaClient } from "@prisma/client";
import { nanoid } from "nanoid";
import { getProviderHashId } from "./provider";
import { providers } from "../../src/util/provider";

const prisma = new PrismaClient();

export default async function anthropicSeed() {
  const providerHashId = await getProviderHashId(providers.Anthropic);
  let models = await Promise.all(
    [
      {
        hashId: nanoid(),
        name: "claude-3-5-sonnet-20240620",
        inputPricePerMillion: 3,
        outputPricePerMillion: 15,
        isFree: false,
        isLoginRequired: true,
        isAvailable: true,
        providerHashId,
      },
      {
        hashId: nanoid(),
        name: "claude-3-opus-20240229",
        inputPricePerMillion: 15,
        outputPricePerMillion: 75,
        isFree: false,
        isLoginRequired: true,
        isAvailable: true,
        providerHashId,
      },
      {
        hashId: nanoid(),
        name: "claude-3-sonnet-20240229",
        inputPricePerMillion: 3,
        outputPricePerMillion: 15,
        isFree: false,
        isLoginRequired: true,
        isAvailable: true,
        providerHashId,
      },
      {
        hashId: nanoid(),
        name: "claude-3-haiku-20240307",
        inputPricePerMillion: 0.25,
        outputPricePerMillion: 1.25,
        isFree: true,
        isLoginRequired: false,
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
        name: "max_tokens",
        type: "integer",
        description: `The maximum number of tokens to generate before stopping.

Note that our models may stop before reaching this maximum. This parameter only specifies the absolute maximum number of tokens to generate.

Different models have different maximum values for this parameter`,
        default: "4906",
      },
      {
        hashId: nanoid(),
        name: "stop_sequences",
        type: "array",
        description: `Custom text sequences that will cause the model to stop generating.

Our models will normally stop when they have naturally completed their turn, which will result in a response stop_reason of "end_turn".

If you want the model to stop generating when it encounters custom strings of text, you can use the stop_sequences parameter. If the model encounters one of the custom sequences, the response stop_reason value will be "stop_sequence" and the response stop_sequence value will contain the matched stop sequence.`,
      },
      {
        hashId: nanoid(),
        name: "temperature",
        type: "number",
        description: `Amount of randomness injected into the response.

Defaults to 1.0. Ranges from 0.0 to 1.0. Use temperature closer to 0.0 for analytical / multiple choice, and closer to 1.0 for creative and generative tasks.

Note that even with temperature of 0.0, the results will not be fully deterministic.`,
        default: "1",
        min: 0,
        max: 1,
      },
      {
        hashId: nanoid(),
        name: "top_k",
        type: "integer",
        description: `Only sample from the top K options for each subsequent token.

Used to remove "long tail" low probability responses. Learn more technical details here.

Recommended for advanced use cases only. You usually only need to use temperature.`,
      },
      {
        hashId: nanoid(),
        name: "top_p",
        type: "number",
        description: `Use nucleus sampling.

In nucleus sampling, we compute the cumulative distribution over all the options for each subsequent token in decreasing probability order and cut it off once it reaches a particular probability specified by top_p. You should either alter temperature or top_p, but not both.

Recommended for advanced use cases only. You usually only need to use temperature.`,
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
