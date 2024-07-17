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
  switch (model) {
    case "gpt-4o-2024-05-13":
      return (5 * input) / 1000000 + (15 * output) / 1000000;
    case "gpt-4-turbo-2024-04-09":
    case "gpt-4-0125-preview":
      return (10 * input) / 1000000 + (30 * output) / 1000000;
    case "gpt-3.5-turbo-0125":
      return (0.5 * input) / 1000000 + (1.5 * output) / 1000000;
    case "claude-3-5-sonnet-20240620":
    case "claude-3-sonnet-20240229":
      return (3 * input) / 1000000 + (15 * output) / 1000000;
    case "claude-3-opus-20240229":
      return (15 * input) / 1000000 + (75 * output) / 1000000;
    case "claude-3-haiku-20240307":
      return (0.25 * input) / 1000000 + (1.25 * output) / 1000000;
    case "claude-2.1":
    case "claude-2.0":
      return (8 * input) / 1000000 + (24 * output) / 1000000;
    case "claude-instant-1.2":
      return (0.8 * input) / 1000000 + (2.4 * output) / 1000000;
    case "mistral-tiny-2312":
      return (0.25 * input) / 1000000 + (0.25 * output) / 1000000;
    case "mistral-small-2312":
    case "mistral-small-2402":
      return (0.7 * input) / 1000000 + (0.7 * output) / 1000000;
    case "open-mixtral-8x22b-2404":
      return (2 * input) / 1000000 + (6 * output) / 1000000;
    case "mistral-medium-2312":
      return (2.7 * input) / 1000000 + (8.1 * output) / 1000000;
    case "mistral-large-2402":
      return (4 * input) / 1000000 + (12 * output) / 1000000;
    case "codestral-2405":
      return (1 * input) / 1000000 + (3 * output) / 1000000;
    case "command-r-plus":
      return (3.0 * input) / 1000000 + (15.0 * output) / 1000000;
    case "command-r":
      return (0.5 * input) / 1000000 + (1.5 * output) / 1000000;
    case "command":
    case "command-nightly":
      return (0.0015 * input) / 1000 + (0.002 * output) / 1000;
    case "command-light":
    case "command-light-nightly":
      return (0.0003 * input) / 1000 + (0.0006 * output) / 1000;
    case "jamba-instruct-preview":
      return (0.5 * input) / 1000000 + (0.7 * output) / 1000000;
    case "meta.llama3-70b-instruct-v1:0":
      return (0.00265 * input) / 1000 + (0.0035 * output) / 1000;
    case "meta.llama3-8b-instruct-v1:0":
      return (0.0003 * input) / 1000 + (0.0006 * output) / 1000;
    case "gemma2-9b-it":
    case "gemma-7b-it":
      return (0.07 * input) / 1000000 + (0.07 * output) / 1000000;
    default:
      return -1;
  }
}

// gpt-4o-2024-05-13
// $5.00 / 1M input tokens
// $15.00 / 1M output tokens

// "gpt-4-turbo-2024-04-09",
// $10.00 / 1M tokens input
// $30.00 / 1M tokens output

// "gpt-4-0125-preview",
// $10.00 / 1M tokens input
// $30.00 / 1M tokens output

// "gpt-3.5-turbo-0125",
// $0.50 / 1M input tokens
// $1.50 / 1M output tokens

// jamba-instruct-preview
// $0.5 / 1M input tokens
// $0.7 / 1M output tokens

// "claude-3-5-sonnet-20240620",
// $3 / 1M tokens input
// $15 / 1M tokens output

//   "claude-3-opus-20240229",
// $15 / 1M tokens input
// $75 / 1M tokens output

//   "claude-3-sonnet-20240229",
// $3 / 1M tokens input
// $15 / 1M tokens output

//   "claude-3-haiku-20240307",
// $0.25 / 1M tokens input
// $1.25 / 1M tokens output

//   "claude-2.1",
// $8 / 1M tokens input
// $24 / 1M tokens output

//   "claude-2.0",
// $8 / 1M tokens input
// $24 / 1M tokens output

//   "claude-instant-1.2",
// $0.8 / 1M tokens input
// $2.4/ 1M tokens output

// "command-r-plus",
// $3.00 / 1M Tokens input
// $15.00/ 1M Tokens output

//   "command-r",
// $0.50/ 1M Tokens input
// $1.50/ 1M Tokens output

//   "command",
// $0.0015 / 1K input
// $0.0020 / 1K output

//   "command-nightly",
// $0.0015 / 1K input
// $0.0020 / 1K output

//   "command-light",
// $0.0003 / 1K input
// $0.0006 / 1K output

//   "command-light-nightly",
// $0.0003 / 1K input
// $0.0006 / 1K output

// "meta.llama3-70b-instruct-v1:0",
// $0.00265 / 1K input
// $0.0035 / 1K output

//   "meta.llama3-8b-instruct-v1:0",
// $0.0003 /1K input
// $0.0006 /1K output

// "mistral-tiny-2312",
// $0.25 /1M tokens	input
// $0.25 /1M tokens output

//   "mistral-small-2312",
// $0.7 /1M tokens input
// $0.7 /1M tokens output

//   "open-mixtral-8x22b-2404",
// $2 /1M tokens	input
// $6 /1M tokens output

//   "mistral-small-2402",
// $1 /1M tokens	input
// $3 /1M tokens output

//   "mistral-medium-2312",
// $2.7 /1M tokens input
// $8.1 /1M tokens output

//   "mistral-large-2402",
// $4 /1M tokens input
// $12 /1M tokens output

//   "codestral-2405",
// $1 /1M tokens	 input
// $3 /1M tokens output

// Gemma-7B-Instruct
// $0.07/$0.07
// (per 1M Tokens, input/output)

export async function getThisMonthPriceSum(
  history: Prisma.TextPromptHistoryDelegate,
  userHashId: string
) {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const result = await history.aggregate({
    _sum: { price: true },
    where: {
      userHashId,
      createdAt: { gte: firstDayOfMonth, lte: lastDayOfMonth },
    },
  });

  return result._sum.price || 0; // Return the sum of the price or 0 if no records found
}
