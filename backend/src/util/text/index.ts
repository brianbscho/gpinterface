import { Static, Type } from "@sinclair/typebox";
import { TextPrompt } from "gpinterface-shared/type/textPrompt";
import { TextMessageSchema } from "gpinterface-shared/type/textMessage";
import { textModels } from "gpinterface-shared/models/text/model";
import { callOpenai } from "./openai";
import { callClaude } from "./anthropic";
import { callMistral } from "./mistral";
import { callCommand } from "./cohere";
import { callJamba } from "./ai21";
import { callBedrock } from "./bedrock";
import { callGroq } from "./google";
import { Prisma } from "@prisma/client";

const TextPromptSchema = Type.Object(TextPrompt);
type TextPromptType = Static<typeof TextPromptSchema>;
type TextMessageType = Static<typeof TextMessageSchema>;

export async function getTextResponse(
  textPrompt: TextPromptType & { messages: TextMessageType[] }
) {
  const { provider, model, systemMessage, messages, config } = textPrompt;
  const systemMergedMessages =
    systemMessage.length > 0
      ? [{ role: "system", content: systemMessage }].concat(messages)
      : messages;

  switch (provider) {
    case textModels[1].provider:
      return callOpenai({ model, messages: systemMergedMessages, ...config });
    case textModels[2].provider:
      return callClaude({
        model,
        messages,
        ...(systemMessage.length > 0 && { system: systemMessage }),
        ...config,
      });
    case textModels[3].provider:
      return callMistral({ model, messages: systemMergedMessages, ...config });
    case textModels[4].provider:
      const message = messages[messages.length - 1].content;
      const chatHistory = messages.slice(0, -1).map((m) => ({
        role: m.role !== "user" ? "CHATBOT" : "USER",
        message: m.content,
      }));
      return callCommand({
        model,
        message,
        chat_history: chatHistory,
        ...(systemMessage.length > 0 && { preamble: systemMessage }),
        ...config,
      });
    case textModels[5].provider:
      return callJamba({ model, messages: systemMergedMessages, ...config });
    case textModels[6].provider:
      return callBedrock({
        modelId: model,
        messages: messages.map(({ role, content }) => ({
          role,
          content: [{ text: content }],
        })),
        ...(systemMessage.length > 0 && { system: [{ text: systemMessage }] }),
        inferenceConfig: config,
      });
    case textModels[7].provider:
      return callGroq({ model, messages: systemMergedMessages, ...config });
    default:
      return { content: "", response: null, inputTokens: 0, outputTokens: 0 };
  }
}

export function getTextPriceByModel(
  model: string,
  input: number,
  output: number
): number {
  const million = 1000000;
  const kilo = 1000;

  switch (model) {
    case "gpt-4o-2024-05-13":
      return (5 * input) / million + (15 * output) / million;
    case "gpt-4o-mini-2024-07-18":
      return (0.15 * input) / million + (0.6 * output) / million;
    case "gpt-4-turbo-2024-04-09":
    case "gpt-4-0125-preview":
      return (10 * input) / million + (30 * output) / million;
    case "gpt-3.5-turbo-0125":
      return (0.5 * input) / million + (1.5 * output) / million;
    case "claude-3-5-sonnet-20240620":
    case "claude-3-sonnet-20240229":
      return (3 * input) / million + (15 * output) / million;
    case "claude-3-opus-20240229":
      return (15 * input) / million + (75 * output) / million;
    case "claude-3-haiku-20240307":
      return (0.25 * input) / million + (1.25 * output) / million;
    case "claude-2.1":
    case "claude-2.0":
      return (8 * input) / million + (24 * output) / million;
    case "claude-instant-1.2":
      return (0.8 * input) / million + (2.4 * output) / million;
    case "open-mistral-nemo-2407":
      return (0.3 * input) / million + (0.3 * output) / million;
    case "open-mixtral-8x22b-2404":
      return (2 * input) / million + (6 * output) / million;
    case "mistral-large-2402":
      return (4 * input) / million + (12 * output) / million;
    case "mistral-medium-2312":
      return (2.7 * input) / million + (8.1 * output) / million;
    case "mistral-small-2402":
      return (1 * input) / million + (3 * output) / million;
    case "mistral-small-2312":
      return (0.7 * input) / million + (0.7 * output) / million;
    case "mistral-tiny-2312":
      return (0.25 * input) / million + (0.25 * output) / million;
    case "codestral-mamba-2407":
      return (0.25 * input) / million + (0.25 * output) / million;
    case "codestral-2405":
      return (1 * input) / million + (3 * output) / million;
    case "command-r-plus":
      return (3.0 * input) / million + (15.0 * output) / million;
    case "command-r":
      return (0.5 * input) / million + (1.5 * output) / million;
    case "command":
    case "command-nightly":
      return (1 * input) / million + (2 * output) / million;
    case "command-light":
    case "command-light-nightly":
      return (0.3 * input) / million + (0.6 * output) / million;
    case "jamba-instruct-preview":
      return (0.5 * input) / million + (0.7 * output) / million;
    case "meta.llama3-70b-instruct-v1:0":
      return (0.00265 * input) / kilo + (0.0035 * output) / kilo;
    case "meta.llama3-8b-instruct-v1:0":
      return (0.0003 * input) / kilo + (0.0006 * output) / kilo;
    case "gemma2-9b-it":
      return (0.2 * input) / million + (0.2 * output) / million;
    case "gemma-7b-it":
      return (0.07 * input) / million + (0.07 * output) / million;
    default:
      throw "Cannot find price info of the model";
  }
}

export async function getTodayPriceSum(
  history: Prisma.TextPromptHistoryDelegate,
  userHashId: string
) {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const tomorrowStart = new Date();
  tomorrowStart.setDate(todayStart.getDate() + 1);
  tomorrowStart.setHours(0, 0, 0, 0);

  const result = await history.aggregate({
    _sum: { price: true },
    where: {
      userHashId,
      createdAt: { gte: todayStart, lt: tomorrowStart },
    },
  });

  return result._sum.price || 0;
}
