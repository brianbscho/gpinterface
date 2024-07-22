import { FastifyInstance } from "fastify";
import { Static } from "@sinclair/typebox";
import {
  ImagePromptDraftExecuteSchema,
  ImagePromptExecuteSchema,
  ImagePromptExecuteResponse,
  ImagePromptUpdateSchema,
  ImagePromptUpdateResponse,
  ImagePromptDeleteSchema,
  ImagePromptBookmarksGetResponse,
} from "gpinterface-shared/type/imagePrompt";
import { isAccessible } from "../util/thread";
import { confirmImagePrompt, getTypedImagePrompts } from "../util/imagePrompt";
import { createEntity, getIdByHashId, upsertEntity } from "../util/prisma";
import { imageModels } from "gpinterface-shared/models/image/model";
import { getInterpolatedString } from "../util/string";
import {
  getImagePriceByModel,
  getImageResponse,
  getTodayPriceSum,
} from "../util/image";
import { getValidBody } from "gpinterface-shared/util";
import { QueryParamSchema } from "gpinterface-shared/type";

export default async function (fastify: FastifyInstance) {
  const { unauthorized, badRequest } = fastify.httpErrors;

  fastify.post<{ Params: Static<typeof ImagePromptExecuteSchema> }>(
    "/:hashId",
    { schema: { params: ImagePromptExecuteSchema } },
    async (request, reply): Promise<ImagePromptExecuteResponse> => {
      try {
        const { user } = await fastify.getUser(request, reply);
        const todayPriceSum = await getTodayPriceSum(
          fastify.prisma.imagePromptHistory,
          user.hashId
        );
        if (todayPriceSum > 1) {
          throw badRequest("You exceeded today's rate limit");
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
            provider: true,
            model: true,
            prompt: true,
            config: true,
          },
        });
        if (!imagePrompt || imagePrompt.prompt.length === 0) {
          throw badRequest("Prompt not exists.");
        }
        isAccessible(imagePrompt.post.thread, user);

        const { prompt, provider, model, config } = imagePrompt;
        const body = getValidBody(prompt, request.body);
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
            config: imagePrompt.config as any,
            input: body,
            url,
            response,
            price,
            userHashId: user.hashId,
          },
        });

        return { url, response, price };
      } catch (ex) {
        console.error(`path: /image/prompt/:hashId, method: post, error:`, ex);
        throw ex;
      }
    }
  );
  fastify.post<{ Body: Static<typeof ImagePromptDraftExecuteSchema> }>(
    "/draft",
    { schema: { body: ImagePromptDraftExecuteSchema } },
    async (request, reply): Promise<ImagePromptExecuteResponse> => {
      try {
        const { user } = await fastify.getUser(request, reply);
        const todayPriceSum = await getTodayPriceSum(
          fastify.prisma.imagePromptHistory,
          user.hashId
        );
        if (todayPriceSum > 1) {
          throw badRequest("You exceeded today's rate limit");
        }

        const { provider, model, prompt, input, config } = request.body;

        if (prompt.trim().length === 0) {
          throw badRequest("Prompt is empty. Please check it again.");
        }

        const body = getValidBody(prompt, input);
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
            config,
            input,
            url,
            response,
            price,
            userHashId: user.hashId,
          },
        });

        return { url, response, price };
      } catch (ex) {
        console.error(`path: /image/prompt/draft, method: post, error:`, ex);
        throw ex;
      }
    }
  );
  fastify.put<{ Body: Static<typeof ImagePromptUpdateSchema> }>(
    "/",
    { schema: { body: ImagePromptUpdateSchema } },
    async (request, reply): Promise<ImagePromptUpdateResponse> => {
      try {
        const { user } = await fastify.getUser(request, reply);
        let { hashId, postHashId, examples, ...imagePrompt } = request.body;

        if (!confirmImagePrompt([{ ...imagePrompt, examples }])) {
          throw badRequest("Provided prompt is invalid. Please check it again");
        }

        const post = await fastify.prisma.post.findFirst({
          where: { hashId: postHashId, userHashId: user.hashId },
          select: {
            hashId: true,
            thread: { select: { isPublic: true, userHashId: true } },
          },
        });
        if (!post) {
          throw unauthorized("Image prompt not found.");
        }
        if (post.thread.isPublic) {
          throw badRequest("Public prompt cannot be edited");
        }
        isAccessible(post.thread, user);

        if (hashId) {
          const imagePromptFound = await fastify.prisma.imagePrompt.findFirst({
            where: { hashId },
            select: { hashId: true },
          });
          if (!imagePromptFound) {
            throw unauthorized("Image prompt not found.");
          }
        }

        let imagePromptHashId = "";
        if (!hashId) {
          const newImagePrompt = await createEntity(
            fastify.prisma.imagePrompt.create,
            {
              data: { ...imagePrompt, postHashId },
              select: { hashId: true },
            }
          );
          imagePromptHashId = newImagePrompt.hashId;
        } else {
          const newImagePrompt = await upsertEntity(
            fastify.prisma.imagePrompt.upsert,
            {
              where: { hashId },
              update: imagePrompt,
              create: { ...imagePrompt, postHashId },
              select: { hashId: true },
            }
          );
          imagePromptHashId = newImagePrompt.hashId;
        }

        await fastify.prisma.imageExample.deleteMany({
          where: {
            OR: [{ imagePromptHashId }, { imagePromptHashId: hashId }],
          },
        });
        for (const example of examples) {
          createEntity(fastify.prisma.imageExample.create, {
            data: { imagePromptHashId, ...example },
          });
        }

        return { hashId: imagePromptHashId };
      } catch (ex) {
        console.error("path: /image/prompt, method: put, error:", ex);
        throw ex;
      }
    }
  );
  fastify.delete<{ Body: Static<typeof ImagePromptDeleteSchema> }>(
    "/",
    { schema: { body: ImagePromptDeleteSchema } },
    async (request, reply): Promise<ImagePromptUpdateResponse> => {
      try {
        const { user } = await fastify.getUser(request, reply);
        const { hashId } = request.body;

        const imagePrompt = await fastify.prisma.imagePrompt.findFirst({
          where: { hashId, post: { userHashId: user.hashId } },
          select: {
            post: {
              select: {
                userHashId: true,
                thread: { select: { isPublic: true } },
              },
            },
          },
        });
        if (!imagePrompt) {
          throw badRequest("No image prompt");
        }
        if (!imagePrompt.post.thread.isPublic) {
          throw badRequest("Not allowed to delete");
        }

        await fastify.prisma.imagePrompt.delete({ where: { hashId } });
        return { hashId };
      } catch (ex) {
        console.error("path: /image/prompt, method: delete, error:", ex);
        throw ex;
      }
    }
  );
  fastify.get<{ Querystring: Static<typeof QueryParamSchema> }>(
    "/bookmarks",
    { schema: { querystring: QueryParamSchema } },
    async (request, reply): Promise<ImagePromptBookmarksGetResponse> => {
      try {
        const { user } = await fastify.getUser(request, reply, true);
        const { lastHashId } = request.query;

        const id = await getIdByHashId(
          fastify.prisma.bookmark.findFirst,
          lastHashId
        );

        const bookmarks = await fastify.prisma.bookmark.findMany({
          where: { ...(id > 0 && { id: { gt: id } }), userHashId: user.hashId },
          select: {
            hashId: true,
            post: {
              select: {
                hashId: true,
                user: { select: { hashId: true, name: true } },
                imagePrompts: {
                  select: {
                    hashId: true,
                    provider: true,
                    model: true,
                    prompt: true,
                    config: true,
                    examples: {
                      select: {
                        hashId: true,
                        input: true,
                        url: true,
                        response: true,
                        price: true,
                      },
                    },
                  },
                },
              },
            },
          },
          orderBy: { id: "asc" },
          take: 20,
        });

        return {
          imagePrompts: bookmarks
            .filter((b) => b.post.imagePrompts.length > 0)
            .map((b) => {
              const { hashId, post } = b;
              const { imagePrompts, ..._post } = post;
              return {
                hashId,
                post: _post,
                imagePrompt: getTypedImagePrompts(imagePrompts)[0],
              };
            }),
        };
      } catch (ex) {
        console.error(
          "path: /image/propmt/bookmarks?lashHashId, method: get, error:",
          ex
        );
        throw ex;
      }
    }
  );
}
