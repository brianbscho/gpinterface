import { FastifyInstance } from "fastify";
import { Static } from "@sinclair/typebox";
import {
  GpiCreateResponse,
  GpiCreateSchema,
  GpiGetResponse,
  GpiUpdateSchema,
} from "gpinterface-shared/type/gpi";
import { DeleteResponse, ParamSchema } from "gpinterface-shared/type";
import { copyGpi, createGpi } from "../controllers/gpi";
import { ContentHistorySelect, getTypedContents } from "../util/prisma";

export default async function (fastify: FastifyInstance) {
  const { httpErrors } = fastify;

  fastify.get<{ Params: Static<typeof ParamSchema> }>(
    "/:hashId",
    { schema: { params: ParamSchema } },
    async (request, reply): Promise<GpiGetResponse> => {
      try {
        const { user } = await fastify.getUser(request, reply, true);
        const { hashId } = request.params;

        const gpi = await fastify.prisma.gpi.findFirst({
          where: {
            hashId,
            OR: [{ userHashId: user.hashId }, { isPublic: true }],
          },
          select: {
            hashId: true,
            userHashId: true,
            description: true,
            chat: {
              select: {
                hashId: true,
                systemMessage: true,
                contents: {
                  select: {
                    hashId: true,
                    role: true,
                    content: true,
                    config: true,
                    model: { select: { hashId: true, name: true } },
                    histories: { select: ContentHistorySelect },
                    isModified: true,
                  },
                },
              },
            },
            config: true,
            modelHashId: true,
            isPublic: true,
          },
        });
        if (!gpi) {
          throw fastify.httpErrors.badRequest("The gpi is not available.");
        }

        const { chat, config, ...rest } = gpi;
        return {
          ...rest,
          config: config as any,
          chat: { ...chat, contents: getTypedContents(chat.contents) },
        };
      } catch (ex) {
        console.error("path: /gpi/:hashId, method: get, error:", ex);
        throw ex;
      }
    }
  );
  fastify.post<{ Body: Static<typeof GpiCreateSchema> }>(
    "/",
    { schema: { body: GpiCreateSchema } },
    async (request, reply): Promise<GpiCreateResponse> => {
      try {
        const { user } = await fastify.getUser(request, reply);
        const { description, chatHashId, isPublic, ...body } = request.body;

        if (description.trim() === "") {
          throw httpErrors.badRequest("description is empty.");
        }

        const chat = await fastify.prisma.chat.findFirst({
          where: { hashId: chatHashId, userHashId: user.hashId },
          select: {
            systemMessage: true,
            contents: {
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
        if (!chat) {
          throw httpErrors.badRequest("chat is not available.");
        }

        const newGpi = await createGpi(fastify.prisma.gpi, {
          ...body,
          description,
          isPublic,
          userHashId: user.hashId,
          chatHashId,
        });

        return { hashId: newGpi.hashId };
      } catch (ex) {
        console.error("path: /gpi, method: post, error:", ex);
        throw ex;
      }
    }
  );
  fastify.put<{
    Params: Static<typeof ParamSchema>;
    Body: Static<typeof GpiUpdateSchema>;
  }>(
    "/:hashId",
    { schema: { params: ParamSchema, body: GpiUpdateSchema } },
    async (request, reply): Promise<GpiCreateResponse> => {
      try {
        const { user } = await fastify.getUser(request, reply);
        const { hashId } = request.params;
        const { description, config, modelHashId, isPublic } = request.body;

        const oldGpi = await fastify.prisma.gpi.findFirst({
          where: { hashId, userHashId: user.hashId },
          select: { hashId: true },
        });
        if (!oldGpi) {
          throw fastify.httpErrors.unauthorized("Gpi not found.");
        }

        const isIsPublicBoolean = typeof isPublic === "boolean";
        if (description || config || modelHashId || isIsPublicBoolean) {
          await fastify.prisma.gpi.update({
            where: { hashId },
            data: {
              ...(!!description && { description }),
              ...(!!config && { config }),
              ...(!!modelHashId && { modelHashId }),
              ...(isIsPublicBoolean && { isPublic }),
            },
          });
        }

        return { hashId };
      } catch (ex) {
        console.error("path: /gpi/:hashId, method: put, error:", ex);
        throw ex;
      }
    }
  );
  fastify.post<{ Body: Static<typeof ParamSchema> }>(
    "/copy",
    { schema: { body: ParamSchema } },
    async (request, reply): Promise<GpiCreateResponse> => {
      try {
        const { user } = await fastify.getUser(request, reply);
        const { hashId } = request.body;

        const gpi = await copyGpi(fastify.prisma, hashId, user.hashId);
        return gpi;
      } catch (ex) {
        console.error("path: /gpi/copy, method: post, error:", ex);
        throw ex;
      }
    }
  );
  fastify.delete<{ Body: Static<typeof ParamSchema> }>(
    "/",
    { schema: { body: ParamSchema } },
    async (request, reply): Promise<DeleteResponse> => {
      try {
        const { user } = await fastify.getUser(request, reply);
        const { hashId } = request.body;

        const gpi = await fastify.prisma.gpi.findFirst({
          where: { hashId, userHashId: user.hashId },
          select: { hashId: true },
        });
        if (!gpi) {
          throw fastify.httpErrors.badRequest("gpi is not available.");
        }

        await fastify.prisma.gpi.delete({ where: { hashId } });

        return { success: true };
      } catch (ex) {
        console.error("path: /chat/:hashId, method: put, error:", ex);
        throw ex;
      }
    }
  );
}
