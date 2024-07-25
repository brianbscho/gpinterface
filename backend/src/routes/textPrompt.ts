import { FastifyInstance } from "fastify";
import { Static } from "@sinclair/typebox";
import {
  TextPromptDraftExecuteSchema,
  TextPromptExecuteSchema,
  TextPromptExecuteResponse,
  TextPromptUpdateSchema,
  TextPromptUpdateResponse,
  TextPromptDeleteSchema,
  TextPromptBookmarksGetResponse,
} from "gpinterface-shared/type/textPrompt";
import { isAccessible } from "../util/thread";
import { confirmTextPrompt, getTypedTextPrompts } from "../util/textPrompt";
import { createEntity, getIdByHashId, upsertEntity } from "../util/prisma";
import { textModels } from "gpinterface-shared/models/text/model";
import {
  getTextPriceByModel,
  getTextResponse,
  getTodayPriceSum,
} from "../util/text";
import { getInterpolatedString } from "../util/string";
import { getValidBody } from "gpinterface-shared/util";
import { QueryParamSchema } from "gpinterface-shared/type";

export default async function (fastify: FastifyInstance) {
  const { unauthorized, badRequest } = fastify.httpErrors;

  fastify.post<{ Params: Static<typeof TextPromptExecuteSchema> }>(
    "/:hashId",
    { schema: { params: TextPromptExecuteSchema } },
    async (request, reply): Promise<TextPromptExecuteResponse> => {
      try {
        const { user } = await fastify.getUser(request, reply);
        const todayPriceSum = await getTodayPriceSum(
          fastify.prisma.textPromptHistory,
          user.hashId
        );
        if (todayPriceSum > 1) {
          throw badRequest("You exceeded today's rate limit");
        }

        const { hashId } = request.params;
        const textPrompt = await fastify.prisma.textPrompt.findFirst({
          where: { hashId },
          select: {
            post: {
              select: {
                userHashId: true,
                thread: {
                  select: { hashId: true, isPublic: true, userHashId: true },
                },
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
        isAccessible(textPrompt.post.thread, user);

        const body = getValidBody(
          textPrompt.systemMessage + JSON.stringify(textPrompt.messages),
          request.body
        );
        const messages = textPrompt.messages.map((m) => ({
          role: m.role,
          content: getInterpolatedString(m.content, body),
        }));
        const systemMessage = getInterpolatedString(
          textPrompt.systemMessage,
          body
        );

        const { provider, model, config } = textPrompt;
        if (!textModels.map((m) => m.provider).includes(provider)) {
          throw badRequest("Selected model is currently not available.");
        }

        let { content, response, inputTokens, outputTokens } =
          await getTextResponse({
            provider,
            model,
            systemMessage,
            config,
            messages,
          });

        const price = await getTextPriceByModel(
          model,
          inputTokens,
          outputTokens
        );
        await createEntity(fastify.prisma.textPromptHistory.create, {
          data: {
            userHashId: user.hashId,
            textPromptHashId: textPrompt.hashId,
            provider,
            model,
            systemMessage: textPrompt.systemMessage,
            config: textPrompt.config as any,
            input: body,
            content,
            response,
            inputTokens,
            outputTokens,
            messages: textPrompt.messages,
            price,
          },
        });

        const { userHashId } = textPrompt.post;
        if (userHashId !== null && userHashId !== user.hashId) {
          await createEntity(fastify.prisma.notification.create, {
            data: {
              userHashId: userHashId,
              message: `${user.name} tried your prompt!`,
              url: `/thread/${textPrompt.post.thread.hashId}`,
            },
          });
        }

        return { content, response, price };
      } catch (ex) {
        console.error(`path: /text/prompt/:hashId, method: post, error:`, ex);
        throw ex;
      }
    }
  );
  fastify.post<{ Body: Static<typeof TextPromptDraftExecuteSchema> }>(
    "/draft",
    { schema: { body: TextPromptDraftExecuteSchema } },
    async (request, reply): Promise<TextPromptExecuteResponse> => {
      try {
        const { user } = await fastify.getUser(request, reply);
        const todayPriceSum = await getTodayPriceSum(
          fastify.prisma.textPromptHistory,
          user.hashId
        );
        if (todayPriceSum > 1) {
          throw badRequest("You exceeded today's rate limit");
        }

        let { systemMessage, messages } = request.body;
        messages = messages.filter((m) => m.content.trim().length > 0);
        if (messages.length === 0) {
          throw badRequest("Message is empty. Please check it again.");
        }

        const body = getValidBody(
          systemMessage + JSON.stringify(messages),
          request.body.input
        );
        messages = messages.map((m) => ({
          role: m.role,
          content: getInterpolatedString(m.content, body),
        }));
        systemMessage = getInterpolatedString(systemMessage, body);

        const { provider, model, config } = request.body;
        if (!textModels.map((m) => m.provider).includes(provider)) {
          throw badRequest("Selected model is currently not available.");
        }

        let { content, response, inputTokens, outputTokens } =
          await getTextResponse({
            provider,
            model,
            systemMessage,
            config,
            messages,
          });

        const price = await getTextPriceByModel(
          model,
          inputTokens,
          outputTokens
        );
        await createEntity(fastify.prisma.textPromptHistory.create, {
          data: {
            userHashId: user.hashId,
            provider,
            model,
            systemMessage: request.body.systemMessage,
            config,
            input: body,
            content,
            response,
            inputTokens,
            outputTokens,
            messages: request.body.messages,
            price,
          },
        });

        return { content, response, price };
      } catch (ex) {
        console.error(`path: /text/prompt/draft, method: post, error:`, ex);
        throw ex;
      }
    }
  );
  fastify.put<{ Body: Static<typeof TextPromptUpdateSchema> }>(
    "/",
    { schema: { body: TextPromptUpdateSchema } },
    async (request, reply): Promise<TextPromptUpdateResponse> => {
      try {
        const { user } = await fastify.getUser(request, reply);
        let { hashId, postHashId, examples, messages, ...textPrompt } =
          request.body;

        messages = messages.filter((m) => m.content.trim().length > 0);
        if (messages.length === 0) {
          throw badRequest("Message is empty. Please check it again.");
        }
        if (!confirmTextPrompt([{ ...textPrompt, messages, examples }])) {
          throw badRequest("Provided prompt is invalid. Please check it again");
        }

        const post = await fastify.prisma.post.findFirst({
          where: { hashId: postHashId },
          select: {
            hashId: true,
            thread: { select: { isPublic: true, userHashId: true } },
          },
        });
        if (!post) {
          throw unauthorized("Text prompt not found.");
        }
        if (post.thread.isPublic) {
          throw badRequest("Public prompt cannot be edited");
        }
        isAccessible(post.thread, user);

        if (hashId) {
          const textPromptFound = await fastify.prisma.textPrompt.findFirst({
            where: { hashId },
            select: { hashId: true },
          });
          if (!textPromptFound) {
            throw unauthorized("Text prompt not found.");
          }
        }

        let textPromptHashId = "";
        if (!hashId) {
          const newTextPrompt = await createEntity(
            fastify.prisma.textPrompt.create,
            { data: { ...textPrompt, postHashId }, select: { hashId: true } }
          );
          textPromptHashId = newTextPrompt.hashId;
        } else {
          const newTextPrompt = await upsertEntity(
            fastify.prisma.textPrompt.upsert,
            {
              where: { hashId },
              update: textPrompt,
              create: { ...textPrompt, postHashId },
              select: { hashId: true },
            }
          );
          textPromptHashId = newTextPrompt.hashId;
        }

        await fastify.prisma.textExample.deleteMany({
          where: {
            OR: [{ textPromptHashId }, { textPromptHashId: hashId }],
          },
        });
        for (const example of examples) {
          createEntity(fastify.prisma.textExample.create, {
            data: { textPromptHashId, ...example },
          });
        }
        for (const message of messages) {
          createEntity(fastify.prisma.textMessage.create, {
            data: { textPromptHashId, ...message },
          });
        }

        return { hashId: textPromptHashId };
      } catch (ex) {
        console.error("path: /text/prompt, method: put, error:", ex);
        throw ex;
      }
    }
  );
  fastify.delete<{ Body: Static<typeof TextPromptDeleteSchema> }>(
    "/",
    { schema: { body: TextPromptDeleteSchema } },
    async (request, reply): Promise<TextPromptUpdateResponse> => {
      try {
        const { user } = await fastify.getUser(request, reply);
        const { hashId } = request.body;

        const textPrompt = await fastify.prisma.textPrompt.findFirst({
          where: { hashId },
          select: {
            post: {
              select: {
                userHashId: true,
                thread: { select: { isPublic: true } },
              },
            },
          },
        });
        if (!textPrompt || textPrompt.post.userHashId !== user.hashId) {
          throw badRequest("No text prompt");
        }
        if (!textPrompt.post.thread.isPublic) {
          throw badRequest("Not allowed to delete");
        }

        await fastify.prisma.textPrompt.delete({ where: { hashId } });
        return { hashId };
      } catch (ex) {
        console.error("path: /text/prompt, method: delete, error:", ex);
        throw ex;
      }
    }
  );
  fastify.get<{ Querystring: Static<typeof QueryParamSchema> }>(
    "/bookmarks",
    { schema: { querystring: QueryParamSchema } },
    async (request, reply): Promise<TextPromptBookmarksGetResponse> => {
      try {
        const { user } = await fastify.getUser(request, reply, true);
        const { lastHashId } = request.query;

        const id = await getIdByHashId(
          fastify.prisma.bookmark.findFirst,
          lastHashId
        );

        const bookmarks = await fastify.prisma.bookmark.findMany({
          where: { ...(id > 0 && { id: { lt: id } }), userHashId: user.hashId },
          select: {
            hashId: true,
            post: {
              select: {
                hashId: true,
                user: { select: { hashId: true, name: true } },
                textPrompts: {
                  select: {
                    hashId: true,
                    provider: true,
                    model: true,
                    systemMessage: true,
                    config: true,
                    examples: {
                      select: {
                        hashId: true,
                        input: true,
                        content: true,
                        response: true,
                        price: true,
                      },
                    },
                    messages: {
                      select: { hashId: true, role: true, content: true },
                    },
                  },
                },
              },
            },
          },
          orderBy: { id: "desc" },
          take: 20,
        });

        return {
          textPrompts: bookmarks
            .filter((b) => b.post.textPrompts.length > 0)
            .map((b) => {
              const { hashId, post } = b;
              const { textPrompts, ..._post } = post;
              return {
                hashId,
                post: _post,
                textPrompt: getTypedTextPrompts(textPrompts)[0],
              };
            }),
        };
      } catch (ex) {
        console.error(
          "path: /text/propmt/bookmarks?lashHashId, method: get, error:",
          ex
        );
        throw ex;
      }
    }
  );
}
