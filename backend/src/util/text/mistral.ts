import { Mistral } from "@mistralai/mistralai";

export async function callMistral(body: any) {
  if (process.env.NODE_ENV === "development") {
    console.log("🚀 ~ body:", body);
  }

  const mistral = new Mistral();
  const response = await mistral.chat.complete(body);
  if (process.env.NODE_ENV === "development") {
    console.log("🚀 ~ response:", response);
  }
  if (!response || !response.choices) {
    throw "mistral API issue";
  }

  const { content } = response.choices[0].message;
  const inputTokens = response.usage.promptTokens;
  const outputTokens = response.usage.completionTokens;
  if (!content) {
    throw "mistral API issue";
  }

  return { content, response, inputTokens, outputTokens };
}
