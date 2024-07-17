import { modelsLabAiModels } from "gpinterface-shared/models/image/modelslab";
import { nanoid } from "nanoid";
import { uploadToS3 } from "../s3";

export async function callModelsLab(model: string, body: any) {
  if (process.env.NODE_ENV === "development") {
    console.log("🚀 ~ body:", body);
  }

  const apiUrl = modelsLabAiModels[0].url;
  if (!apiUrl) {
    throw "Wrong ModelsLab model name!";
  }

  const headers = { "Content-Type": "application/json" };
  const response = await fetch(apiUrl, {
    method: "POST",
    headers,
    body: JSON.stringify({
      key: process.env.MODELS_LAB_API_KEY,
      ...body,
      enhance_prompt: "no",
    }),
  });
  if (process.env.NODE_ENV === "development") {
    console.log("🚀 ~ response:", response);
  }

  if (!response.ok) {
    throw "ModelsLab Api issue";
  }
  const jsonResponse: any = await response.json();
  if (!jsonResponse.output || jsonResponse.output.length === 0) {
    throw "ModelsLab Api issue";
  }

  const imageResponse = await fetch(jsonResponse.output[0]);
  const blob = await imageResponse.blob();
  const buffer = Buffer.from(await blob.arrayBuffer());
  const date = new Date();

  const extension = body.output_format ?? "png";
  const key = `${model}/${date.getFullYear()}/${
    date.getMonth() + 1
  }/${date.getDate()}/${nanoid()}.${extension}`;
  const url = await uploadToS3(key, `image/${extension}`, buffer);

  return { url, response: jsonResponse };
}
