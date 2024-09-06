import { FastifyInstance } from "fastify";
import { Static } from "@sinclair/typebox";
import {
  GpiCreateResponse,
  GpiCreateSchema,
  GpiGetResponse,
  GpiUpdateResponse,
  GpiUpdateSchema,
} from "gpinterface-shared/type/gpi";
import { DeleteResponse, ParamSchema } from "gpinterface-shared/type";
import { copyGpiEntry, createGpiEntry } from "../controllers/gpi";
import { ContentHistorySelect, getTypedContents } from "../util/prisma";

export default async function (fastify: FastifyInstance) {
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
        });
        if (!gpi) {
          throw fastify.httpErrors.badRequest("The gpi is not available.");
        }

        const { config, chatContents, ...rest } = gpi;
        return {
          ...rest,
          config: config as any,
          chatContents: getTypedContents(chatContents),
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

        const gpi = await copyGpiEntry(fastify.prisma, hashId, user.hashId);
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

        await fastify.prisma.gpi.deleteMany({ where: { hashId } });

        return { success: true };
      } catch (ex) {
        console.error("path: /gpi/:hashId, method: put, error:", ex);
        throw ex;
      }
    }
  );
}
