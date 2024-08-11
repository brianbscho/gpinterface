export async function callJamba(body: any) {
  if (process.env.NODE_ENV === "development") {
    console.log("🚀 ~ body:", body);
  }

  const response = await fetch(
    "https://api.ai21.com/studio/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.AI21_API_KEY}`,
      },
      body: JSON.stringify(body),
    }
  );
  if (process.env.NODE_ENV === "development") {
    console.log("🚀 ~ response:", response);
  }

  if (!response.ok) {
    throw "AI21 API issue";
  }
  const jsonResponse: any = await response.json();
  if (!jsonResponse.choices) {
    throw "AI21 API issue";
  }

  const { content } = jsonResponse.choices[0]?.message;
  const inputTokens: number = Number(jsonResponse.usage?.prompt_tokens);
  const outputTokens: number = Number(jsonResponse.usage?.completion_tokens);
  if (!content || !inputTokens || !outputTokens) {
    throw "AI21 API issue";
  }

  return { content, response: jsonResponse, inputTokens, outputTokens };
}
