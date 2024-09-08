import { FastifyInstance } from "fastify";
import { Static } from "@sinclair/typebox";
import {
  DeleteResponse,
  HashIdParam,
  LastHashIdParam,
} from "gpinterface-shared/type";
import {
  ChatCompletionContentsQuery,
  ChatCompletionModelSelect,
  ContentHistorySelect,
  createEntity,
  createManyEntities,
  getTypedContent,
  getTypedContents,
  getTypedHistory,
  getUpdatedAtByHashId,
} from "../../util/prisma";
import {
  GpiCreateResponse,
  GpiCreateSchema,
  GpiDeploySchema,
  GpiGetResponse,
  GpisGetResponse,
  GpiUpdateResponse,
  GpiUpdateSchema,
} from "gpinterface-shared/type/gpi";
import {
  ChatContentCreateSchema,
  ChatContentsCreateResponse,
} from "gpinterface-shared/type/chat-content";
import { getTextResponse } from "../../util/text";
import { copyGpiEntry, createGpiEntry } from "../../services/gpi";

export default async function (fastify: FastifyInstance) {
  fastify.post<{ Body: Static<typeof GpiCreateSchema> }>(
    "/",
    { schema: { body: GpiCreateSchema } },
    async (request, reply): Promise<GpiCreateResponse> => {
      try {
        const { user } = await fastify.getUser(request, reply);
        const { modelHashId, config } = request.body;

        const newGpi = await createGpiEntry(fastify.prisma.gpi, {
          userHashId: user.hashId,
          modelHashId,
          config,
          description: "",
          isPublic: false,
          systemMessage: "",
          chatContents: [],
        });

        return { hashId: newGpi.hashId };
      } catch (ex) {
        console.error("path: /users/gpis, method: post, error:", ex);
        throw ex;
      }
    }
  );
  fastify.patch<{
    Params: Static<typeof HashIdParam>;
    Body: Static<typeof GpiUpdateSchema>;
  }>(
    "/:hashId",
    { schema: { params: HashIdParam, body: GpiUpdateSchema } },
    async (request, reply): Promise<GpiUpdateResponse> => {
      try {
        const { user } = await fastify.getUser(request, reply);
        const { hashId } = request.params;
        const { description, systemMessage, config, modelHashId, isPublic } =
          request.body;

        const oldGpi = await fastify.prisma.gpi.findFirst({
          where: { hashId, userHashId: user.hashId },
          select: { hashId: true },
        });
        if (!oldGpi) {
          throw fastify.httpErrors.unauthorized("Gpi not found.");
        }

        const isIsPublicBoolean = typeof isPublic === "boolean";
        const updatedGpi = await fastify.prisma.gpi.update({
          where: { hashId },
          data: {
            ...(!!description && { description }),
            ...(!!systemMessage && { systemMessage }),
            ...(!!config && { config }),
            ...(!!modelHashId && { modelHashId }),
            ...(isIsPublicBoolean && { isPublic }),
            updatedAt: new Date(),
          },
          select: {
            hashId: true,
            description: true,
            systemMessage: true,
            config: true,
            modelHashId: true,
            isPublic: true,
          },
        });

        return { ...updatedGpi, config: updatedGpi.config as any };
      } catch (ex) {
        console.error("path: /users/gpis/:hashId, method: patch, error:", ex);
        throw ex;
      }
    }
  );
  fastify.post<{
    Params: Static<typeof HashIdParam>;
    Body: Static<typeof GpiDeploySchema>;
  }>(
    "/:hashId/deploy",
    { schema: { params: HashIdParam, body: GpiDeploySchema } },
    async (request, reply): Promise<GpiCreateResponse> => {
      try {
        const { user } = await fastify.getUser(request, reply);
        const { hashId } = request.params;

        const gpi = await fastify.prisma.gpi.findFirst({
          where: { hashId, userHashId: user.hashId },
          select: {
            isDeployed: true,
            chatContents: {
              select: {
                role: true,
                content: true,
                config: true,
                modelHashId: true,
              },
              orderBy: { id: "asc" },
            },
          },
        });
        if (!gpi) {
          throw fastify.httpErrors.unauthorized("Gpi not found.");
        }
        if (gpi.isDeployed) {
          throw fastify.httpErrors.unauthorized("Gpi is already deployed");
        }
        if (gpi.chatContents.some((c) => c.content === "")) {
          throw fastify.httpErrors.badRequest(
            "There is empty content in chat."
          );
        }

        await fastify.prisma.gpi.update({
          where: { hashId },
          data: { ...request.body, isDeployed: true, updatedAt: new Date() },
        });
        await fastify.prisma.chatContent.updateMany({
          where: { gpiHashId: hashId },
          data: { isDeployed: true },
        });
        await createManyEntities(fastify.prisma.chatContent.createMany, {
          data: gpi.chatContents.map((c) => ({
            ...c,
            config: c.config as any,
            gpiHashId: hashId,
          })),
        });

        return { hashId };
      } catch (ex) {
        console.error(
          "path: /users/gpis/:hashId/deploy, method: post, error:",
          ex
        );
        throw ex;
      }
    }
  );
  fastify.post<{ Params: Static<typeof HashIdParam> }>(
    "/:hashId/copy",
    { schema: { params: HashIdParam } },
    async (request, reply): Promise<GpiCreateResponse> => {
      try {
        const { user } = await fastify.getUser(request, reply);
        const { hashId } = request.params;

        const gpi = await copyGpiEntry(fastify.prisma, hashId, user.hashId);
        return gpi;
      } catch (ex) {
        console.error(
          "path: /users/gpis/:hashId/copy, method: post, error:",
          ex
        );
        throw ex;
      }
    }
  );
  fastify.delete<{ Params: Static<typeof HashIdParam> }>(
    "/:hashId",
    { schema: { params: HashIdParam } },
    async (request, reply): Promise<DeleteResponse> => {
      try {
        const { user } = await fastify.getUser(request, reply);
        const { hashId } = request.params;

        const gpi = await fastify.prisma.gpi.findFirst({
          where: { hashId, userHashId: user.hashId },
          select: { hashId: true },
        });
        if (!gpi) {
          throw fastify.httpErrors.badRequest("gpi is not available.");
        }

        await fastify.prisma.gpi.delete({ where: { hashId } });

        return { hashIds: [hashId] };
      } catch (ex) {
        console.error("path: /users/gpis/:hashId, method: put, error:", ex);
        throw ex;
      }
    }
  );
  fastify.post<{
    Params: Static<typeof HashIdParam>;
    Body: Static<typeof ChatContentCreateSchema>;
  }>(
    "/:hashId/chat/contents/completion",
    { schema: { params: HashIdParam, body: ChatContentCreateSchema } },
    async (request, reply): Promise<ChatContentsCreateResponse> => {
      try {
        const { user } = await fastify.getUser(request, reply);
        const { hashId } = request.params;
        const { content, ...body } = request.body;
        if (content.trim() === "") {
          throw fastify.httpErrors.badRequest("Empty content");
        }

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
        const messages = chatContents.concat({ role: "user", content });
        let response = await getTextResponse({
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
              content,
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
              content: response.content,
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
            ...response,
          },
          select: { ...ContentHistorySelect, hashId: true },
        });
        await fastify.prisma.gpi.update({
          where: { hashId },
          data: { updatedAt: new Date() },
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
          "path: /users/gpis/:hashId/chat/contents/completion, method: post, error:",
          ex
        );
        throw ex;
      }
    }
  );
  fastify.post<{ Params: Static<typeof HashIdParam> }>(
    "/:hashId/chat/contents",
    { schema: { params: HashIdParam } },
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
        await fastify.prisma.gpi.update({
          where: { hashId },
          data: { updatedAt: new Date() },
        });

        return getTypedContents(chatContents);
      } catch (ex) {
        console.error(
          "path: /users/gpis/:hashId/chat/contents, method: post, error:",
          ex
        );
        throw ex;
      }
    }
  );
  fastify.get<{ Querystring: Static<typeof LastHashIdParam> }>(
    "/",
    { schema: { querystring: LastHashIdParam } },
    async (request, reply): Promise<GpisGetResponse> => {
      try {
        const { user } = await fastify.getUser(request, reply);
        const { lastHashId } = request.query;

        const updatedAt = await getUpdatedAtByHashId(
          fastify.prisma.gpi.findFirst,
          lastHashId
        );

        const gpis = await fastify.prisma.gpi.findMany({
          where: {
            ...(!!updatedAt && { updatedAt: { lt: updatedAt } }),
            userHashId: user.hashId,
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
                isDeployed: true,
              },
              orderBy: { id: "asc" },
            },
            config: true,
            modelHashId: true,
            isPublic: true,
            isDeployed: true,
            _count: {
              select: { chatContents: { where: { isDeployed: false } } },
            },
          },
          orderBy: { updatedAt: "desc" },
          take: 5,
        });

        return gpis.map((gpi) => {
          const { chatContents, config, ...rest } = gpi;
          return {
            ...rest,
            isEditing: gpi._count.chatContents > 0,
            config: config as any,
            chatContents: getTypedContents(
              chatContents.filter((c) => gpi.isDeployed === c.isDeployed)
            ),
          };
        });
      } catch (ex) {
        console.error("path: /users/gpis?lastHashId, method: get, error:", ex);
        throw ex;
      }
    }
  );
  fastify.get<{ Params: Static<typeof HashIdParam> }>(
    "/:hashId",
    { schema: { params: HashIdParam } },
    async (request, reply): Promise<GpiGetResponse> => {
      try {
        const { user } = await fastify.getUser(request, reply);
        const { hashId } = request.params;

        const gpi = await fastify.prisma.gpi.findFirst({
          where: { hashId, userHashId: user.hashId },
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
              where: { isDeployed: false },
              orderBy: { id: "asc" },
            },
            config: true,
            modelHashId: true,
            isPublic: true,
            isDeployed: true,
            _count: {
              select: { chatContents: { where: { isDeployed: false } } },
            },
          },
        });
        if (!gpi) {
          throw fastify.httpErrors.badRequest("The gpi is not available.");
        }

        const { config, chatContents, ...rest } = gpi;
        return {
          ...rest,
          isEditing: gpi._count.chatContents > 0,
          config: config as any,
          chatContents: getTypedContents(chatContents),
        };
      } catch (ex) {
        console.error("path: /users/gpis/:hashId, method: get, error:", ex);
        throw ex;
      }
    }
  );
}
