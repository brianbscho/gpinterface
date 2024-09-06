import { FastifyInstance } from "fastify";
import { Static } from "@sinclair/typebox";
import {
  ListParamSchema,
  ParamSchema,
  SearchQueryParamSchema,
} from "gpinterface-shared/type";
import {
  ChatCompletionContentsQuery,
  ChatCompletionModelSelect,
  ContentHistorySelect,
  createEntity,
  createManyEntities,
  getIdByHashId,
  getTypedContent,
  getTypedContents,
  getTypedHistory,
} from "../util/prisma";
import { GpisGetResponse } from "gpinterface-shared/type/gpi";
import {
  ChatContentCreateSchema,
  ChatContentsCreateResponse,
} from "gpinterface-shared/type/chatContent";
import { getTextResponse } from "../util/text";

export default async function (fastify: FastifyInstance) {
  fastify.get<{ Querystring: Static<typeof ListParamSchema> }>(
    "/",
    { schema: { querystring: ListParamSchema } },
    async (request, reply): Promise<GpisGetResponse> => {
      try {
        const { user } = await fastify.getUser(request, reply, true);
        const { lastHashId } = request.query;
        const id = await getIdByHashId(
          fastify.prisma.gpi.findFirst,
          lastHashId
        );

        const gpis = await fastify.prisma.gpi.findMany({
          where: {
            ...(id > 0 && { id: { lt: id } }),
            OR: [{ userHashId: user.hashId }, { isPublic: true }],
          },
          select: {
            hashId: true,
            userHashId: true,
            description: true,
            systemMessage: true,
            chatContents: {
              select: {
                hashId: true,
                role: true,
                content: true,
                config: true,
                model: { select: { hashId: true, name: true } },
                histories: { select: ContentHistorySelect },
                isModified: true,
              },
              where: { isDeployed: true },
            },
            config: true,
            modelHashId: true,
            isPublic: true,
          },
          orderBy: { id: "desc" },
          take: 5,
        });

        return gpis.map((gpi) => {
          const { config, chatContents, ...rest } = gpi;
          return {
            ...rest,
            config: config as any,
            chatContents: getTypedContents(chatContents),
          };
        });
      } catch (ex) {
        console.error("path: /gpis?lastHashId, method: get, error:", ex);
        throw ex;
      }
    }
  );
  fastify.get<{ Querystring: Static<typeof SearchQueryParamSchema> }>(
    "/search",
    { schema: { querystring: SearchQueryParamSchema } },
    async (request, reply): Promise<GpisGetResponse> => {
      try {
        const { user } = await fastify.getUser(request, reply, true);
        const { keyword, lastHashId } = request.query;
        const id = await getIdByHashId(
          fastify.prisma.gpi.findFirst,
          lastHashId
        );
        const search = keyword.split(" ").join(" | ");

        const gpis = await fastify.prisma.gpi.findMany({
          where: {
            ...(id > 0 && { id: { lt: id } }),
            AND: [
              { OR: [{ userHashId: user.hashId }, { isPublic: true }] },
              {
                OR: [
                  { description: { search } },
                  { systemMessage: { search } },
                  { chatContents: { some: { content: { search } } } },
                ],
              },
            ],
          },
          select: {
            hashId: true,
            userHashId: true,
            description: true,
            systemMessage: true,
            chatContents: {
              select: {
                hashId: true,
                role: true,
                content: true,
                config: true,
                model: { select: { hashId: true, name: true } },
                histories: { select: ContentHistorySelect },
                isModified: true,
              },
              where: { isDeployed: true },
            },
            config: true,
            modelHashId: true,
            isPublic: true,
          },
          orderBy: { id: "desc" },
          take: 5,
        });

        return gpis.map((gpi) => {
          const { chatContents, config, ...rest } = gpi;
          return {
            ...rest,
            config: config as any,
            chatContents: getTypedContents(chatContents),
          };
        });
      } catch (ex) {
        console.error(
          "path: /gpis/search?keyword&lastHashId, method: get, error:",
          ex
        );
        throw ex;
      }
    }
  );
  fastify.get<{
    Querystring: Static<typeof ListParamSchema>;
  }>(
    "/user",
    { schema: { querystring: ListParamSchema } },
    async (request, reply): Promise<GpisGetResponse> => {
      try {
        const { user } = await fastify.getUser(request, reply);
        const { lastHashId } = request.query;

        const id = await getIdByHashId(
          fastify.prisma.gpi.findFirst,
          lastHashId
        );

        const gpis = await fastify.prisma.gpi.findMany({
          where: { ...(id > 0 && { id: { lt: id } }), userHashId: user.hashId },
          select: {
            hashId: true,
            userHashId: true,
            description: true,
            systemMessage: true,
            chatContents: {
              select: {
                hashId: true,
                role: true,
                content: true,
                config: true,
                model: { select: { hashId: true, name: true } },
                histories: { select: ContentHistorySelect },
                isModified: true,
              },
              where: { isDeployed: true },
            },
            config: true,
            modelHashId: true,
            isPublic: true,
          },
          orderBy: { id: "desc" },
          take: 5,
        });

        return gpis.map((gpi) => {
          const { chatContents, config, ...rest } = gpi;
          return {
            ...rest,
            config: config as any,
            chatContents: getTypedContents(chatContents),
          };
        });
      } catch (ex) {
        console.error("path: /gpis/user?lastHashId, method: get, error:", ex);
        throw ex;
      }
    }
  );
  fastify.post<{
    Params: Static<typeof ParamSchema>;
    Body: Static<typeof ChatContentCreateSchema>;
  }>(
    "/:hashId/chat/contents/completions",
    { schema: { params: ParamSchema, body: ChatContentCreateSchema } },
    async (request, reply): Promise<ChatContentsCreateResponse> => {
      try {
        const { user } = await fastify.getUser(request, reply);
        const { hashId } = request.params;
        const { content: userContent, ...body } = request.body;

        const model = await fastify.prisma.model.findFirst({
          where: {
            hashId: body.modelHashId,
            isAvailable: true,
            isFree: true,
            ...(!user.hashId && { isLoginRequired: false }),
          },
          select: ChatCompletionModelSelect,
        });
        if (!model) {
          throw fastify.httpErrors.badRequest("model is not available.");
        }

        const gpi = await fastify.prisma.gpi.findFirst({
          where: { hashId, userHashId: user.hashId },
          select: {
            systemMessage: true,
            chatContents: ChatCompletionContentsQuery,
            userHashId: true,
          },
        });
        if (!gpi) {
          throw fastify.httpErrors.badRequest("gpi is not available.");
        }
        if (gpi.chatContents.some((c) => c.content === "")) {
          throw fastify.httpErrors.badRequest(
            "There is empty content in chat."
          );
        }

        const { systemMessage, chatContents } = gpi;
        const messages = [...chatContents];
        messages.push({ role: "user", content: userContent });
        let { content, ...response } = await getTextResponse({
          model,
          systemMessage,
          config: body.config,
          messages,
        });

        const userChatContent = await createEntity(
          fastify.prisma.chatContent.create,
          {
            data: {
              gpiHashId: hashId,
              role: "user",
              content: userContent,
              isDeployed: false,
            },
            select: {
              hashId: true,
              role: true,
              content: true,
              isModified: true,
            },
          }
        );
        const assistantChatContent = await createEntity(
          fastify.prisma.chatContent.create,
          {
            data: {
              ...body,
              gpiHashId: hashId,
              role: "assistant",
              content,
              isDeployed: false,
            },
            select: {
              hashId: true,
              model: true,
              role: true,
              content: true,
              config: true,
              isModified: true,
            },
          }
        );

        const history = await createEntity(fastify.prisma.history.create, {
          data: {
            userHashId: user.hashId || null,
            gpiHashId: hashId,
            chatContentHashId: assistantChatContent.hashId,
            provider: model.provider.name,
            model: model.name,
            config: body.config,
            messages: (systemMessage
              ? [{ role: "system", content: systemMessage }]
              : []
            ).concat(messages),
            content,
            ...response,
          },
          select: { ...ContentHistorySelect, hashId: true },
        });

        return [
          userChatContent,
          {
            ...getTypedContent(assistantChatContent),
            history: getTypedHistory(history),
          },
        ];
      } catch (ex) {
        console.error(
          "path: /gpis/:hashId/chat/contents/comopletions, method: post, error:",
          ex
        );
        throw ex;
      }
    }
  );
  fastify.post<{ Params: Static<typeof ParamSchema> }>(
    "/:hashId/chat/contents",
    { schema: { body: ParamSchema } },
    async (request, reply): Promise<ChatContentsCreateResponse> => {
      try {
        const { user } = await fastify.getUser(request, reply);
        const { hashId } = request.params;

        const gpi = await fastify.prisma.gpi.findFirst({
          where: { hashId, userHashId: user.hashId },
          select: { hashId: true },
        });
        if (!gpi) {
          throw fastify.httpErrors.badRequest("gpi not found");
        }

        const chatContents = await createManyEntities(
          fastify.prisma.chatContent.createManyAndReturn,
          {
            data: [
              {
                gpiHashId: hashId,
                role: "user",
                content: "",
                isDeployed: false,
              },
              {
                gpiHashId: hashId,
                role: "assistant",
                content: "",
                isDeployed: false,
              },
            ],
            select: {
              hashId: true,
              model: { select: { hashId: true, name: true } },
              role: true,
              content: true,
              config: true,
              isModified: true,
            },
          }
        );

        return getTypedContents(chatContents);
      } catch (ex) {
        console.error(
          "path: /gpis/:hashId/chat/contents, method: post, error:",
          ex
        );
        throw ex;
      }
    }
  );
}
