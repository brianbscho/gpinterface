import { Static, Type } from "@sinclair/typebox";
import { ImagePrompt } from "gpinterface-shared/type/imagePrompt";
import { callStabilityAi } from "./stability.ai";
import { imageModels } from "gpinterface-shared/models/image/model";
import { callModelsLab } from "./modelslab";
import { Prisma } from "@prisma/client";

const ImagePromptSchema = Type.Object(ImagePrompt);
type ImagePromptType = Static<typeof ImagePromptSchema>;

export async function getImageResponse(imagePrompt: ImagePromptType) {
  const { provider, model, prompt, config } = imagePrompt;
  switch (provider) {
    case imageModels[0].provider:
      return callStabilityAi(model, {
        ...(model.includes("v1")
          ? { text_prompts: [{ text: prompt, weight: 1 }] }
          : { prompt }),
        ...config,
      });
    case imageModels[1].provider:
      return callModelsLab(model, { prompt, ...config });
    default:
      return { url: "", response: null };
  }
}

export function getImagePriceByModel(model: string) {
  const hundred = 100;
  switch (model) {
    case "stable-image-ultra":
      return 8 / hundred;
    case "stable-image-core":
      return 3 / hundred;
    case "stable-diffusion-3-medium":
      return 3.5 / hundred;
    case "stable-diffusion-3-large":
      return 6.5 / hundred;
    case "stable-diffusion-3-large-turbo":
      return 4 / hundred;
    case "stable-diffusion-v1-6":
      return 1 / hundred;
    case "stable-diffusion-xl-1024-v1-0":
      return 0.6 / hundred;
    case "ModelsLab":
      return 0.009;
    default:
      throw "Cannot find price info of the model";
  }
}

export async function getTodayPriceSum(
  history: Prisma.ImagePromptHistoryDelegate,
  userHashId: string
) {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const tomorrowStart = new Date();
  tomorrowStart.setDate(todayStart.getDate() + 1);
  tomorrowStart.setHours(0, 0, 0, 0);

  const result = await history.aggregate({
    _sum: { price: true },
    where: {
      userHashId,
      createdAt: { gte: todayStart, lt: tomorrowStart },
    },
  });

  return result._sum.price || 999;
}
