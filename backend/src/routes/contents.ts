import { FastifyInstance } from "fastify";
import { Static } from "@sinclair/typebox";
import { createManyEntities, getTypedContents } from "../util/prisma";
import {
  ContentsCreateResponse,
  ContentsCreateSchema,
  ContentsDeleteResponse,
  ContentsDeleteSchema,
} from "gpinterface-shared/type/content";

export default async function (fastify: FastifyInstance) {
  fastify.delete<{ Body: Static<typeof ContentsDeleteSchema> }>(
    "/",
    { schema: { body: ContentsDeleteSchema } },
    async (request, reply): Promise<ContentsDeleteResponse> => {
      try {
        const { user } = await fastify.getUser(request, reply, true);
        const { hashIds } = request.body;

        const oldContents = await fastify.prisma.chatContent.findMany({
          where: {
            hashId: { in: hashIds },
            chat: { OR: [{ userHashId: user.hashId }, { userHashId: null }] },
          },
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
  fastify.post<{ Body: Static<typeof ContentsCreateSchema> }>(
    "/",
    { schema: { body: ContentsCreateSchema } },
    async (request, reply): Promise<ContentsCreateResponse> => {
      try {
        const { user } = await fastify.getUser(request, reply, true);
        const { chatHashId } = request.body;

        const chat = await fastify.prisma.chat.findFirst({
          where: {
            OR: [{ userHashId: user.hashId }, { userHashId: null }],
            hashId: chatHashId,
          },
          select: { hashId: true },
        });
        if (!chat) {
          throw fastify.httpErrors.badRequest("chat not found");
        }

        const contents = await createManyEntities(
          fastify.prisma.chatContent.createManyAndReturn,
          {
            data: [
              { chatHashId, role: "user", content: "" },
              { chatHashId, role: "assistant", content: "" },
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

        return { contents: getTypedContents(contents) };
      } catch (ex) {
        console.error("path: /chats, method: post, error:", ex);
        throw ex;
      }
    }
  );
}
