import { CohereClient, Cohere } from "cohere-ai";

export async function callCommand(body: Cohere.ChatRequest) {
  if (process.env.NODE_ENV === "development") {
    console.log("🚀 ~ body:", body);
  }

  const cohere = new CohereClient({
    token: process.env.COHERE_API_KEY,
  });

  const response = await cohere.chat(body);
  if (process.env.NODE_ENV === "development") {
    console.log("🚀 ~ response:", response);
  }

  const { text } = response;
  const inputTokens = response.meta?.billedUnits?.inputTokens;
  const outputTokens = response.meta?.billedUnits?.outputTokens;
  if (!text || !inputTokens || !outputTokens) {
    throw "Cohere command issue";
  }

  return { response, content: text, inputTokens, outputTokens };
}
