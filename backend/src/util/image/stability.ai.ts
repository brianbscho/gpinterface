import { stabilityAiModels } from "gpinterface-shared/models/image/stability.ai";
import { nanoid } from "nanoid";
import { uploadToS3 } from "../s3";

function formatBody(isV1: boolean, body: any) {
  if (isV1) {
    return JSON.stringify(body);
  }
  const formData = new FormData();
  Object.keys(body).forEach((key) => {
    formData.append(key, body[key]);
  });
  return formData;
}

export async function callStabilityAi(model: string, body: any) {
  const apiUrl = stabilityAiModels.find((m) => m.name === model)?.url;
  if (process.env.NODE_ENV === "development") {
    console.log("🚀 ~ body:", body);
    console.log("🚀 ~ apiUrl:", apiUrl);
  }

  if (!apiUrl) {
    throw "Wrong stability.ai model name!";
  }

  const headers = {
    ...(apiUrl.includes("v1") && { "Content-Type": "application/json" }),
    Accept: apiUrl.includes("v1") ? "image/png" : `image/*`,
    Authorization: `Bearer ${process.env.STABILITY_AI_API_KEY}`,
  };
  const response = await fetch(apiUrl, {
    method: "POST",
    headers,
    body: formatBody(apiUrl.includes("v1"), body),
  });
  if (process.env.NODE_ENV === "development") {
    console.log("🚀 ~ response:", response);
  }

  if (!response.ok) {
    if (process.env.NODE_ENV === "development") {
      const json = await response.json();
      console.log("🚀 ~ callStabilityAi ~ json:", json);
    }
    throw "Stability AI Api issue";
  }

  const blob = await response.blob();
  const buffer = Buffer.from(await blob.arrayBuffer());
  const date = new Date();

  const extension = body.output_format ?? "png";
  const key = `${model}/${date.getFullYear()}/${
    date.getMonth() + 1
  }/${date.getDate()}/${nanoid()}.${extension}`;
  const url = await uploadToS3(key, `image/${extension}`, buffer);

  return { url, response: { url } };
}
