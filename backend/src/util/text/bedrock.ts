import {
  BedrockRuntimeClient,
  ConverseCommand,
} from "@aws-sdk/client-bedrock-runtime";

export async function callBedrock(body: any) {
  if (process.env.NODE_ENV === "development") {
    console.log("🚀 ~ body:", body);
  }

  const client = new BedrockRuntimeClient({ region: "us-west-2" });
  const command = new ConverseCommand(body);
  const response = await client.send(command);
  if (process.env.NODE_ENV === "development") {
    console.log("🚀 ~ response:", response);
  }

  if (
    !response.output ||
    !response.output.message ||
    !response.output.message.content
  ) {
    throw "AWS bedrock issue";
  }

  const { text } = response.output.message.content[0];
  const inputTokens = response.usage?.inputTokens;
  const outputTokens = response.usage?.outputTokens;
  if (!text || !inputTokens || !outputTokens) {
    throw "AWS bedrock issue";
  }

  return { response, content: text, inputTokens, outputTokens };
}
