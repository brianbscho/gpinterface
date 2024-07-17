import Groq from "groq-sdk";

export async function callGroq(body: any) {
  if (process.env.NODE_ENV === "development") {
    console.log("🚀 ~ body:", body);
  }

  const groq = new Groq();
  const response = await groq.chat.completions.create(body);
  if (process.env.NODE_ENV === "development") {
    console.log("🚀 ~ response:", response);
  }

  const { content } = response.choices[0]?.message;
  const inputTokens = response.usage?.prompt_tokens;
  const outputTokens = response.usage?.completion_tokens;
  if (!content || !inputTokens || !outputTokens) {
    throw "groq API issue";
  }

  return { content, response, inputTokens, outputTokens };
}
