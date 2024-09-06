import { FastifyInstance } from "fastify";
import { Static } from "@sinclair/typebox";
import { createManyEntities, getTypedContents } from "../util/prisma";
import {
  ChatContentsCreateResponse,
  ChatContentsCreateSchema,
  ChatContentsDeleteSchema,
} from "gpinterface-shared/type/chatContent";
import { DeleteResponse } from "gpinterface-shared/type";

export default async function (fastify: FastifyInstance) {
  fastify.delete<{ Body: Static<typeof ChatContentsDeleteSchema> }>(
    "/",
    { schema: { body: ChatContentsDeleteSchema } },
    async (request, reply): Promise<DeleteResponse> => {
      try {
        const { user } = await fastify.getUser(request, reply);
        const { hashIds } = request.body;

        const oldContents = await fastify.prisma.chatContent.findMany({
          where: { hashId: { in: hashIds }, gpi: { userHashId: user.hashId } },
          select: { hashId: true },
        });
        if (oldContents.length !== hashIds.length) {
          throw fastify.httpErrors.badRequest("Deletion is not possible.");
        }

        await fastify.prisma.chatContent.deleteMany({
          where: { hashId: { in: hashIds } },
        });

        return { success: true };
      } catch (ex) {
        console.error("path: /contents, method: delete, error:", ex);
        throw ex;
      }
    }
  );
  fastify.post<{ Body: Static<typeof ChatContentsCreateSchema> }>(
    "/",
    { schema: { body: ChatContentsCreateSchema } },
    async (request, reply): Promise<ChatContentsCreateResponse> => {
      try {
        const { user } = await fastify.getUser(request, reply);
        const { gpiHashId } = request.body;

        const gpi = await fastify.prisma.gpi.findFirst({
          where: { userHashId: user.hashId },
          select: { hashId: true },
        });
        if (!gpi) {
          throw fastify.httpErrors.badRequest("gpi not found");
        }

        const chatContents = await createManyEntities(
          fastify.prisma.chatContent.createManyAndReturn,
          {
            data: [
              { gpiHashId, role: "user", content: "" },
              { gpiHashId, role: "assistant", content: "" },
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
        console.error("path: /contents, method: post, error:", ex);
        throw ex;
      }
    }
  );
}
