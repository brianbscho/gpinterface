import { FastifyInstance } from "fastify";
import { Static } from "@sinclair/typebox";
import { QueryParamSchema } from "gpinterface-shared/type";
import {
  createManyEntities,
  getIdByHashId,
  ContentHistorySelect,
  getTypedContents,
} from "../util/prisma";
import {
  ContentsCreateResponse,
  ContentsCreateSchema,
  ContentsDeleteResponse,
  ContentsDeleteSchema,
  ContentsGetResponse,
  ContentsGetSchema,
} from "gpinterface-shared/type/content";

export default async function (fastify: FastifyInstance) {
  fastify.get<{
    Params: Static<typeof ContentsGetSchema>;
    Querystring: Static<typeof QueryParamSchema>;
  }>(
    "/:chatHashId",
    { schema: { params: ContentsGetSchema, querystring: QueryParamSchema } },
    async (request, reply): Promise<ContentsGetResponse> => {
      try {
        const { user } = await fastify.getUser(request, reply, true);
        const { lastHashId } = request.query;
        const { chatHashId } = request.params;

        const id = await getIdByHashId(
          fastify.prisma.chatContent.findFirst,
          lastHashId
        );

        const contents = await fastify.prisma.chatContent.findMany({
          where: {
            ...(id > 0 && { id: { lt: id } }),
            chat: { hashId: chatHashId, userHashId: user.hashId || null },
          },
          select: {
            hashId: true,
            model: {
              select: { hashId: true, name: true },
            },
            role: true,
            content: true,
            config: true,
            histories: { select: ContentHistorySelect },
          },
          orderBy: { id: "desc" },
          take: 20,
        });

        return { contents: getTypedContents(contents).reverse() };
      } catch (ex) {
        console.error("path: /contents:chatHashId, method: get, error:", ex);
        throw ex;
      }
    }
  );
  fastify.delete<{ Body: Static<typeof ContentsDeleteSchema> }>(
    "/",
    { schema: { body: ContentsDeleteSchema } },
    async (request, reply): Promise<ContentsDeleteResponse> => {
      try {
        const { user } = await fastify.getUser(request, reply, true);
        const userHashId = user.hashId || null;
        const { hashIds } = request.body;

        const oldContents = await fastify.prisma.chatContent.findMany({
          where: { hashId: { in: hashIds }, chat: { userHashId } },
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
        const { user } = await fastify.getUser(request, reply);
        const { chatHashId } = request.body;

        const chat = await fastify.prisma.chat.findFirst({
          where: { userHashId: user.hashId, hashId: chatHashId },
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
              histories: { select: ContentHistorySelect },
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
