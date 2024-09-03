import { GoogleGenerativeAI, ModelParams } from "@google/generative-ai";

export async function callGemini(
  body: ModelParams,
  history: { role: string; parts: { text: string }[] }[],
  message: string
) {
  if (process.env.NODE_ENV === "development") {
    console.log("🚀 ~ body:", body);
  }
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw "GOOGLE_API_KEY is missing";
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel(body);
  const chat = model.startChat({ history });
  const result = await chat.sendMessage(message);
  const { response } = result;

  if (process.env.NODE_ENV === "development") {
    console.log("🚀 ~ response:", response);
  }

  const content = response.text();
  const inputTokens = response.usageMetadata?.promptTokenCount;
  const outputTokens = response.usageMetadata?.candidatesTokenCount;
  if (!content || !inputTokens || !outputTokens) {
    throw "groq API issue";
  }
  const { functionCalls, text, functionCall, ...rest } = response;

  return { content, response: rest, inputTokens, outputTokens };
}
