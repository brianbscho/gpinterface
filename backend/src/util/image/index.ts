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
    case imageModels[1].provider:
      return callStabilityAi(model, {
        ...(model.includes("v1")
          ? { text_prompts: [{ text: prompt, weight: 1 }] }
          : { prompt }),
        ...config,
      });
    case imageModels[2].provider:
      return callModelsLab(model, { prompt, ...config });
    default:
      return { url: "", response: null };
  }
}

export function getImagePriceByModel(model: string) {
  switch (model) {
    case "stable-image-ultra":
      return 0.08;
    case "stable-image-core":
      return 0.03;
    case "stable-diffusion-3-medium":
      return 0.035;
    case "stable-diffusion-3-large":
      return 0.065;
    case "stable-diffusion-3-large-turbo":
      return 0.04;
    case "stable-diffusion-v1-6":
      return 0.006;
    case "stable-diffusion-xl-1024-v1-0":
      return 0.01;
    case "ModelsLab":
      return 0.009;
    default:
      return 0;
  }
}

// Stability AI
// $10 per 1,000 credits
// Ultra	8 credits
// Core	3 credits
// Stable Diffusion 3 Medium 3.5 credits
// Stable Diffusion 3 Large 6.5 credits
// Stable Diffusion 3 Large Turbo credits 4
// SDXL 1.0 0.2-0.6 credits
// SD 1.6 0.2-1.0 credits

//
// ModelsLab
// $27 / 3,250 API Calls

export async function getThisMonthPriceSum(
  history: Prisma.ImagePromptHistoryDelegate,
  userHashId: string
) {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const result = await history.aggregate({
    _sum: { price: true },
    where: {
      userHashId,
      createdAt: { gte: firstDayOfMonth, lte: lastDayOfMonth },
    },
  });

  return result._sum.price || 0;
}
