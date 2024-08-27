import { FastifyInstance } from "fastify";
import {
  createEntity,
  ContentHistorySelect,
  getTypedContents,
} from "../util/prisma";
import {
  ChatCreateResponse,
  ChatUpdateSchema,
  ChatUpdateResponse,
  ChatsGetResponse,
} from "gpinterface-shared/type/chat";
import { Static } from "@sinclair/typebox";
import { ParamSchema } from "gpinterface-shared/type";
import { getDateString } from "../util/string";

export default async function (fastify: FastifyInstance) {
  fastify.get<{ Params: Static<typeof ParamSchema> }>(
    "/:hashId",
    { schema: { params: ParamSchema } },
    async (request, reply): Promise<ChatsGetResponse["chats"][0]> => {
      try {
        const { user } = await fastify.getUser(request, reply, true);
        const { hashId } = request.params;

        const chat = await fastify.prisma.chat.findFirst({
          where: {
            hashId,
            OR: [{ userHashId: user.hashId }, { userHashId: null }],
          },
          select: {
            hashId: true,
            userHashId: true,
            _count: { select: { gpis: true } },
            systemMessage: true,
            contents: {
              select: {
                hashId: true,
                model: { select: { hashId: true, name: true } },
                role: true,
                content: true,
                config: true,
                histories: { select: ContentHistorySelect },
              },
              orderBy: { id: "asc" },
            },
            createdAt: true,
          },
          orderBy: { id: "desc" },
          take: 5,
        });
        if (!chat) {
          throw fastify.httpErrors.badRequest("chat is not available.");
        }

        const { _count, createdAt, contents, ...rest } = chat;
        return {
          ...rest,
          contents: getTypedContents(contents),
          createdAt: getDateString(createdAt),
          isGpi: _count.gpis > 0,
        };
      } catch (ex) {
        console.error("path: /chat/:hashId, method: get, error:", ex);
        throw ex;
      }
    }
  );
  fastify.post("/", async (request, reply): Promise<ChatCreateResponse> => {
    try {
      const { user } = await fastify.getUser(request, reply, true);
      const userHashId = user.hashId || null;

      const chat = await createEntity(fastify.prisma.chat.create, {
        data: { userHashId },
        select: { hashId: true, createdAt: true },
      });

      return {
        hashId: chat.hashId,
        userHashId,
        isGpi: false,
        systemMessage: "",
        contents: [],
        createdAt: getDateString(chat.createdAt),
      };
    } catch (ex) {
      console.error("path: /chat, method: post, error:", ex);
      throw ex;
    }
  });
  fastify.put<{
    Params: Static<typeof ParamSchema>;
    Body: Static<typeof ChatUpdateSchema>;
  }>(
    "/:hashId",
    { schema: { params: ParamSchema, body: ChatUpdateSchema } },
    async (request, reply): Promise<ChatUpdateResponse> => {
      try {
        const { user } = await fastify.getUser(request, reply, true);
        const { hashId } = request.params;
        const { systemMessage } = request.body;

        const chat = await fastify.prisma.chat.findFirst({
          where: {
            hashId,
            OR: [{ userHashId: user.hashId }, { userHashId: null }],
          },
          select: { userHashId: true },
        });
        if (!chat) {
          throw fastify.httpErrors.badRequest("chat is not available.");
        }

        await fastify.prisma.chat.update({
          where: { hashId },
          data: { systemMessage },
        });

        return { systemMessage };
      } catch (ex) {
        console.error("path: /chat/:hashId, method: put, error:", ex);
        throw ex;
      }
    }
  );
}
