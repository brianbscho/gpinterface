import OpenAI from "openai";
import { ChatCompletionCreateParamsNonStreaming } from "openai/resources";

export async function callOpenai(body: ChatCompletionCreateParamsNonStreaming) {
  if (process.env.NODE_ENV === "development") {
    console.log("🚀 ~ body:", body);
  }

  const openai = new OpenAI();
  const response = await openai.chat.completions.create(body);
  if (process.env.NODE_ENV === "development") {
    console.log("🚀 ~ response:", response);
  }

  const { content } = response.choices[0].message;
  const inputTokens = response.usage?.prompt_tokens;
  const outputTokens = response.usage?.completion_tokens;
  if (!content || !inputTokens || !outputTokens) {
    throw "openai API issue";
  }

  return { content, response, inputTokens, outputTokens };
}
