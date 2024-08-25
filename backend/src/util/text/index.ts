import { callOpenai } from "./openai";
import { callClaude } from "./anthropic";
import { callMistral } from "./mistral";
import { callCommand } from "./cohere";
import { callJamba } from "./ai21_labs";
import { callBedrock } from "./bedrock";
import { providers } from "../provider";

const MILLION = 1000000;

type Model = {
  provider: {
    name: string;
  };
  name: string;
  inputPricePerMillion: number;
  outputPricePerMillion: number;
};
type Message = { role: string; content: string };

export async function getTextResponse(body: {
  model: Model;
  systemMessage: string;
  config: object;
  messages: Message[];
}) {
  const { model, systemMessage, messages, config } = body;
  const { provider, name, inputPricePerMillion, outputPricePerMillion } = model;
  const systemMergedMessages =
    systemMessage.length > 0
      ? [{ role: "system", content: systemMessage }].concat(messages)
      : messages;

  const response = await (async function () {
    switch (provider.name) {
      case providers.OpenAI:
        return callOpenai({
          model: name,
          messages: systemMergedMessages,
          ...config,
        });
      case providers.Anthropic:
        return callClaude({
          model: name,
          messages,
          ...(systemMessage.length > 0 && { system: systemMessage }),
          max_tokens: 4096,
          ...config,
        });
      case providers.MistralAI:
        return callMistral({
          model: name,
          messages: systemMergedMessages,
          ...config,
        });
      case providers.Cohere:
        const message = messages[messages.length - 1].content;
        const chatHistory = messages.slice(0, -1).map((m) => ({
          role: m.role !== "user" ? "CHATBOT" : "USER",
          message: m.content,
        }));
        return callCommand({
          model: name,
          message,
          chat_history: chatHistory,
          ...(systemMessage.length > 0 && { preamble: systemMessage }),
          ...config,
        });
      case providers.AI21Labs:
        return callJamba({
          model: name,
          messages: systemMergedMessages,
          ...config,
        });
      case providers.Meta:
        return callBedrock({
          modelId: name,
          messages: messages.map(({ role, content }) => ({
            role,
            content: [{ text: content }],
          })),
          ...(systemMessage.length > 0 && {
            system: [{ text: systemMessage }],
          }),
          inferenceConfig: config,
        });
      default:
        return { content: "", response: null, inputTokens: 0, outputTokens: 0 };
    }
  })();

  const price =
    (inputPricePerMillion * response.inputTokens) / MILLION +
    (outputPricePerMillion * response.outputTokens) / MILLION;
  return { ...response, price };
}
