import Anthropic from "@anthropic-ai/sdk";

export async function callClaude(body: any) {
  if (process.env.NODE_ENV === "development") {
    console.log("🚀 ~ body:", body);
  }

  const anthropic = new Anthropic();
  const response = await anthropic.messages.create(body);
  if (process.env.NODE_ENV === "development") {
    console.log("🚀 ~ response:", response);
  }

  const { content } = response;
  if (content.length === 0 || content[0].type !== "text") {
    throw "anthropic API issue";
  }

  const inputTokens = response.usage.input_tokens;
  const outputTokens = response.usage.output_tokens;
  const { text } = content[0];
  return { response, content: text, inputTokens, outputTokens };
}
