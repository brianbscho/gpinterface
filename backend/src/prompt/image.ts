import { FastifyInstance } from "fastify";
import { Static } from "@sinclair/typebox";
import { getRequiredKeys } from "gpinterface-shared/string";
import {
  ImagePromptExecuteSchema,
  ImagePromptExecuteResponse,
} from "gpinterface-shared/type/imagePrompt";
import { isAccessible } from "../util/thread";
import { createEntity } from "../util/prisma";
import { imageModels } from "gpinterface-shared/models/image/model";
import {
  getImagePriceByModel,
  getThisMonthPriceSum,
  getImageResponse,
} from "../util/image";
import { getInterpolatedString } from "../util/string";
import { getApiKey } from "./controllers/apiKey";
import { getValidBody } from "../util";

export default async function (fastify: FastifyInstance) {
  const { badRequest } = fastify.httpErrors;

  fastify.post<{ Params: Static<typeof ImagePromptExecuteSchema> }>(
    "/:hashId",
    { schema: { params: ImagePromptExecuteSchema } },
    async (request, reply): Promise<ImagePromptExecuteResponse> => {
      try {
        const apiKey = await getApiKey(fastify, request);
        const thisMonthPriceSum = await getThisMonthPriceSum(
          fastify.prisma.imagePromptHistory,
          apiKey.user.hashId
        );
        if (thisMonthPriceSum > 1) {
          throw badRequest("You exceeded this month's rate limit");
        }

        const { hashId } = request.params;
        const imagePrompt = await fastify.prisma.imagePrompt.findFirst({
          where: { hashId },
          select: {
            post: {
              select: {
                userHashId: true,
                thread: { select: { isPublic: true, userHashId: true } },
              },
            },
            hashId: true,
            provider: true,
            model: true,
            prompt: true,
            config: true,
          },
        });
        if (!imagePrompt || imagePrompt.prompt.length === 0) {
          throw badRequest("Prompt not exists.");
        }
        isAccessible(imagePrompt.post.thread, apiKey.user);

        const { prompt, provider, model, config } = imagePrompt;
        const requiredKeys = getRequiredKeys(prompt);
        const body = getValidBody(request.body, requiredKeys);
        const interpolatedPrompt = getInterpolatedString(prompt, body);

        if (!imageModels.map((m) => m.provider).includes(provider)) {
          throw badRequest("Selected model is currently not available.");
        }

        const { url, response } = await getImageResponse({
          provider,
          model,
          config,
          prompt: interpolatedPrompt,
        });

        const price = await getImagePriceByModel(model);
        await createEntity(fastify.prisma.imagePromptHistory.create, {
          data: {
            provider,
            model,
            prompt,
            config: config as any,
            input: body,
            url,
            response,
            price,
            apiKeyHashId: apiKey.hashId,
            userHashId: apiKey.user.hashId,
          },
        });

        return { url, response, price };
      } catch (ex) {
        console.error(`path: /image/:hashId, method: post, error:`, ex);
        throw ex;
      }
    }
  );
}
