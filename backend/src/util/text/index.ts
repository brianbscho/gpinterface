import { callOpenai } from "./openai";
import { callClaude } from "./anthropic";
import { callMistral } from "./mistral";
import { callCommand } from "./cohere";
import { callJamba } from "./ai21-labs";
import { callBedrock } from "./bedrock";
import { Provider } from "../provider";
import { callGemini } from "./google";

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
  if (messages.some((m) => m.content === "")) {
    throw "There is empty content in chat.";
  }

  const { provider, name, inputPricePerMillion, outputPricePerMillion } = model;
  const typedMessages = messages.map((m) => ({
    role: m.role === "user" ? ("user" as const) : ("assistant" as const),
    content: m.content,
  }));
  const systemMergedMessages =
    systemMessage.length > 0
      ? [{ role: "system" as const, content: systemMessage }, ...typedMessages]
      : typedMessages;
  const history = [...messages];
  const message = history.pop();
  if (!message) {
    throw "No message to process";
  }

  const response = await (async function () {
    switch (provider.name) {
      case Provider.OpenAI:
        return callOpenai({
          model: name,
          messages: systemMergedMessages,
          ...config,
        });
      case Provider.Anthropic:
        return callClaude({
          model: name,
          messages: typedMessages,
          ...(systemMessage.length > 0 && { system: systemMessage }),
          max_tokens: 4096,
          ...config,
        });
      case Provider.MistralAI:
        return callMistral({
          model: name,
          messages: systemMergedMessages,
          ...config,
        });
      case Provider.Cohere:
        const chatHistory = history.map((m) => ({
          role: m.role !== "user" ? ("CHATBOT" as const) : ("USER" as const),
          message: m.content,
        }));
        return callCommand({
          model: name,
          message: message.content,
          chatHistory,
          ...(systemMessage.length > 0 && { preamble: systemMessage }),
          ...config,
        });
      case Provider.Gemini:
        return callGemini(
          { model: name, systemInstruction: systemMessage, ...config },
          messages.map((m) => ({
            role: m.role !== "user" ? "model" : "user",
            parts: [{ text: m.content }],
          })),
          message.content
        );
      case Provider.AI21Labs:
        return callJamba({
          model: name,
          messages: systemMergedMessages,
          ...config,
        });
      case Provider.Meta:
        return callBedrock({
          modelId: name,
          messages: typedMessages.map(({ role, content }) => ({
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
