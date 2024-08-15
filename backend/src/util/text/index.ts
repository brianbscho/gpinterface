import { callOpenai } from "./openai";
import { callClaude } from "./anthropic";
import { callMistral } from "./mistral";
import { callCommand } from "./cohere";
import { callJamba } from "./ai21_labs";
import { callBedrock } from "./bedrock";
import { Prisma } from "@prisma/client";
import { providers } from "../provider";

type TextPromptType = {
  provider: string;
  model: string;
  systemMessage: string;
  config: object;
};
type TextMessageType = { role: string; content: string };

export async function getTextResponse(
  textPrompt: TextPromptType & { messages: TextMessageType[] }
) {
  const { provider, model, systemMessage, messages, config } = textPrompt;
  const systemMergedMessages =
    systemMessage.length > 0
      ? [{ role: "system", content: systemMessage }].concat(messages)
      : messages;

  switch (provider) {
    case providers.OpenAI:
      return callOpenai({ model, messages: systemMergedMessages, ...config });
    case providers.Anthropic:
      return callClaude({
        model,
        messages,
        ...(systemMessage.length > 0 && { system: systemMessage }),
        ...config,
      });
    case providers.MistralAI:
      return callMistral({ model, messages: systemMergedMessages, ...config });
    case providers.Cohere:
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
    case providers.AI21Labs:
      return callJamba({ model, messages: systemMergedMessages, ...config });
    case providers.Meta:
      return callBedrock({
        modelId: model,
        messages: messages.map(({ role, content }) => ({
          role,
          content: [{ text: content }],
        })),
        ...(systemMessage.length > 0 && { system: [{ text: systemMessage }] }),
        inferenceConfig: config,
      });
    default:
      return { content: "", response: null, inputTokens: 0, outputTokens: 0 };
  }
}

export async function getTodayPriceSum(
  history: Prisma.HistoryDelegate,
  userHashId: string
) {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const tomorrowStart = new Date();
  tomorrowStart.setDate(todayStart.getDate() + 1);
  tomorrowStart.setHours(0, 0, 0, 0);

  const histories = await history.findMany({
    where: {
      userHashId,
      createdAt: { gte: todayStart, lt: tomorrowStart },
    },
    select: { price: true },
  });
  const priceSum = histories.reduce((acc, curr) => acc + curr.price, 0);
  return priceSum;
}
