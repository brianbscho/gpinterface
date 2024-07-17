import { FastifyInstance } from "fastify";
import { Static } from "@sinclair/typebox";
import { getRequiredKeys } from "gpinterface-shared/string";
import {
  TextPromptExecuteSchema,
  TextPromptExecuteResponse,
} from "gpinterface-shared/type/textPrompt";
import { isAccessible } from "../util/thread";
import { createEntity } from "../util/prisma";
import { textModels } from "gpinterface-shared/models/text/model";
import { getApiKey } from "./controllers/apiKey";
import { getInterpolatedString } from "../util/string";
import {
  getTextPriceByModel,
  getThisMonthPriceSum,
  getTextResponse,
} from "../util/text";
import { getValidBody } from "../util";

export default async function (fastify: FastifyInstance) {
  const { badRequest } = fastify.httpErrors;

  fastify.post<{ Params: Static<typeof TextPromptExecuteSchema> }>(
    "/:hashId",
    { schema: { params: TextPromptExecuteSchema } },
    async (request, reply): Promise<TextPromptExecuteResponse> => {
      try {
        const apiKey = await getApiKey(fastify, request);
        const thisMonthPriceSum = await getThisMonthPriceSum(
          fastify.prisma.textPromptHistory,
          apiKey.user.hashId
        );
        if (thisMonthPriceSum > 1) {
          throw badRequest("You exceeded this month's rate limit");
        }

        const { hashId } = request.params;
        const textPrompt = await fastify.prisma.textPrompt.findFirst({
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
            systemMessage: true,
            config: true,
            messages: { select: { role: true, content: true } },
          },
        });
        if (!textPrompt || textPrompt.messages.length === 0) {
          throw badRequest("Prompt not exists.");
        }
        isAccessible(textPrompt.post.thread, apiKey.user);

        const requiredKeys = getRequiredKeys(
          textPrompt.systemMessage + JSON.stringify(textPrompt.messages)
        );
        const body = getValidBody(request.body, requiredKeys);
        const messages = textPrompt.messages.map((m) => ({
          role: m.role,
          content: getInterpolatedString(m.content, body),
        }));
        const systemMessage = getInterpolatedString(
          textPrompt.systemMessage,
          body
        );

        const { provider, model } = textPrompt;
        if (!textModels.map((m) => m.provider).includes(provider)) {
          throw badRequest("Selected model is currently not available.");
        }

        let { content, response, inputTokens, outputTokens } =
          await getTextResponse({
            ...textPrompt,
            systemMessage,
            messages,
          });

        const price = await getTextPriceByModel(
          model,
          inputTokens,
          outputTokens
        );
        await createEntity(fastify.prisma.textPromptHistory.create, {
          data: {
            apiKeyHashId: apiKey.hashId,
            userHashId: apiKey.user.hashId,
            textPromptHashId: textPrompt.hashId,
            provider,
            model,
            systemMessage: textPrompt.systemMessage,
            config: textPrompt.config as any,
            input: body,
            content,
            response: response as any,
            inputTokens,
            outputTokens,
            messages: textPrompt.messages,
            price,
          },
        });
        return { content, response, price };
      } catch (ex) {
        console.error(`path: /text/:hashId, method: post, error:`, ex);
        throw ex;
      }
    }
  );
}
