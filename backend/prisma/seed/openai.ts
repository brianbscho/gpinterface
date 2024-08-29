import { PrismaClient } from "@prisma/client";
import { nanoid } from "nanoid";
import { getProviderHashId } from "./provider";
import { providers } from "../../src/util/provider";

const prisma = new PrismaClient();

export default async function openaiSeed() {
  const providerHashId = await getProviderHashId(providers.OpenAI);
  let models = await Promise.all(
    [
      {
        hashId: nanoid(),
        name: "gpt-4o-mini",
        inputPricePerMillion: 0.15,
        outputPricePerMillion: 0.6,
        isFree: true,
        isLoginRequired: false,
        isAvailable: true,
        providerHashId,
      },
      {
        hashId: nanoid(),
        name: "gpt-4o-mini-2024-07-18",
        inputPricePerMillion: 0.15,
        outputPricePerMillion: 0.6,
        isFree: true,
        isLoginRequired: true,
        isAvailable: true,
        providerHashId,
      },
      {
        hashId: nanoid(),
        name: "gpt-4o",
        inputPricePerMillion: 5.0,
        outputPricePerMillion: 15.0,
        isFree: false,
        isLoginRequired: true,
        isAvailable: true,
        providerHashId,
      },
      {
        hashId: nanoid(),
        name: "gpt-4o-2024-08-06",
        inputPricePerMillion: 2.5,
        outputPricePerMillion: 10.0,
        isFree: false,
        isLoginRequired: true,
        isAvailable: true,
        providerHashId,
      },
      {
        hashId: nanoid(),
        name: "gpt-4o-2024-05-13",
        inputPricePerMillion: 5.0,
        outputPricePerMillion: 15.0,
        isFree: false,
        isLoginRequired: true,
        isAvailable: true,
        providerHashId,
      },
      {
        hashId: nanoid(),
        name: "gpt-4-turbo",
        inputPricePerMillion: 10.0,
        outputPricePerMillion: 30.0,
        isFree: false,
        isLoginRequired: true,
        isAvailable: true,
        providerHashId,
      },
      {
        hashId: nanoid(),
        name: "gpt-4-turbo-2024-04-09",
        inputPricePerMillion: 10.0,
        outputPricePerMillion: 30.0,
        isFree: false,
        isLoginRequired: true,
        isAvailable: true,
        providerHashId,
      },
      {
        hashId: nanoid(),
        name: "gpt-4",
        inputPricePerMillion: 30.0,
        outputPricePerMillion: 60.0,
        isFree: false,
        isLoginRequired: true,
        isAvailable: true,
        providerHashId,
      },
      {
        hashId: nanoid(),
        name: "gpt-4-32k",
        inputPricePerMillion: 60.0,
        outputPricePerMillion: 120.0,
        isFree: false,
        isLoginRequired: true,
        isAvailable: true,
        providerHashId,
      },
      {
        hashId: nanoid(),
        name: "gpt-4-0125-preview",
        inputPricePerMillion: 10.0,
        outputPricePerMillion: 30.0,
        isFree: false,
        isLoginRequired: true,
        isAvailable: true,
        providerHashId,
      },
      {
        hashId: nanoid(),
        name: "gpt-4-1106-preview",
        inputPricePerMillion: 10.0,
        outputPricePerMillion: 30.0,
        isFree: false,
        isLoginRequired: true,
        isAvailable: true,
        providerHashId,
      },
      {
        hashId: nanoid(),
        name: "gpt-3.5-turbo-0125",
        inputPricePerMillion: 0.5,
        outputPricePerMillion: 1.5,
        isFree: true,
        isLoginRequired: true,
        isAvailable: true,
        providerHashId,
      },
      {
        hashId: nanoid(),
        name: "gpt-3.5-turbo-1106",
        inputPricePerMillion: 1.0,
        outputPricePerMillion: 2.0,
        isFree: true,
        isLoginRequired: true,
        isAvailable: true,
        providerHashId,
      },
      {
        hashId: nanoid(),
        name: "gpt-3.5-turbo-0613",
        inputPricePerMillion: 1.5,
        outputPricePerMillion: 2.0,
        isFree: true,
        isLoginRequired: true,
        isAvailable: true,
        providerHashId,
      },
      {
        hashId: nanoid(),
        name: "gpt-3.5-turbo-16k-0613",
        inputPricePerMillion: 3.0,
        outputPricePerMillion: 4.0,
        isFree: true,
        isLoginRequired: true,
        isAvailable: true,
        providerHashId,
      },
      {
        hashId: nanoid(),
        name: "gpt-3.5-turbo-0301",
        inputPricePerMillion: 1.5,
        outputPricePerMillion: 2.0,
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
        name: "frequency_penalty",
        type: "number",
        description:
          "Number between -2.0 and 2.0. Positive values penalize new tokens based on their existing frequency in the text so far, decreasing the model's likelihood to repeat the same line verbatim.",
        default: "0",
        min: -2,
        max: 2,
      },
      {
        hashId: nanoid(),
        name: "top_logprobs",
        type: "integer",
        description:
          "An integer between 0 and 20 specifying the number of most likely tokens to return at each token position, each with an associated log probability. logprobs must be set to true if this parameter is used.",
        min: 0,
        max: 20,
      },
      {
        hashId: nanoid(),
        name: "max_tokens",
        type: "integer",
        description: `The maximum number of tokens that can be generated in the chat completion.

The total length of input tokens and generated tokens is limited by the model's context length.`,
      },
      {
        hashId: nanoid(),
        name: "presence_penalty",
        type: "number",
        description:
          "Number between -2.0 and 2.0. Positive values penalize new tokens based on whether they appear in the text so far, increasing the model's likelihood to talk about new topics.",
        default: "0",
        min: -2,
        max: 2,
      },
      {
        hashId: nanoid(),
        name: "response_format",
        type: "object",
        description: `An object specifying the format that the model must output. Compatible with GPT-4o, GPT-4o mini, GPT-4 Turbo and all GPT-3.5 Turbo models newer than gpt-3.5-turbo-1106.

Setting to { "type": "json_schema", "json_schema": {...} } enables Structured Outputs which ensures the model will match your supplied JSON schema.

Setting to { "type": "json_object" } enables JSON mode, which ensures the message the model generates is valid JSON.

Important: when using JSON mode, you must also instruct the model to produce JSON yourself via a system or user message. Without this, the model may generate an unending stream of whitespace until the generation reaches the token limit, resulting in a long-running and seemingly "stuck" request. Also note that the message content may be partially cut off if finish_reason="length", which indicates the generation exceeded max_tokens or the conversation exceeded the max context length.`,
        default: '{"type":"text"}',
      },
      {
        hashId: nanoid(),
        name: "seed",
        type: "integer",
        description:
          "This feature is in Beta. If specified, our system will make a best effort to sample deterministically, such that repeated requests with the same seed and parameters should return the same result. Determinism is not guaranteed, and you should refer to the system_fingerprint response parameter to monitor changes in the backend.",
      },
      {
        hashId: nanoid(),
        name: "service_tier",
        type: "string",
        description: `Specifies the latency tier to use for processing the request. This parameter is relevant for customers subscribed to the scale tier service:

If set to 'auto', the system will utilize scale tier credits until they are exhausted.
If set to 'default', the request will be processed using the default service tier with a lower uptime SLA and no latency guarentee.
When not set, the default behavior is 'auto'.
When this parameter is set, the response body will include the service_tier utilized.`,
        default: "default",
      },
      {
        hashId: nanoid(),
        name: "stop",
        type: "array",
        description:
          "Up to 4 sequences where the API will stop generating further tokens",
      },
      {
        hashId: nanoid(),
        name: "temperature",
        type: "number",
        description: `What sampling temperature to use, between 0 and 2. Higher values like 0.8 will make the output more random, while lower values like 0.2 will make it more focused and deterministic.

We generally recommend altering this or top_p but not both.`,
        min: 0,
        max: 2,
      },
      {
        hashId: nanoid(),
        name: "top_p",
        type: "number",
        description: `An alternative to sampling with temperature, called nucleus sampling, where the model considers the results of the tokens with top_p probability mass. So 0.1 means only the tokens comprising the top 10% probability mass are considered.

We generally recommend altering this or temperature but not both.`,
        default: "1",
      },
      {
        hashId: nanoid(),
        name: "logprobs",
        type: "boolean",
        description: `Whether to return log probabilities of the output tokens or not. If true, returns the log probabilities of each output token returned in the content of message.`,
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
