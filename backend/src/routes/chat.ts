import { FastifyInstance } from "fastify";
import { createEntity } from "../util/prisma";
import {
  ChatCreateResponse,
  ChatDuplicateResponse,
  ChatUpdateSchema,
  ChatUpdateResponse,
  ChatsGetResponse,
} from "gpinterface-shared/type/chat";
import { Static } from "@sinclair/typebox";
import { ParamSchema } from "gpinterface-shared/type";
import { createChat } from "../controllers/chat";
import { getDateString } from "../util/string";
import { getTypedContent } from "../util/content";

export default async function (fastify: FastifyInstance) {
  fastify.get<{ Params: Static<typeof ParamSchema> }>(
    "/:hashId",
    { schema: { params: ParamSchema } },
    async (request, reply): Promise<ChatsGetResponse["chats"][0]> => {
      try {
        const { user } = await fastify.getUser(request, reply, true);
        const { hashId } = request.params;

        const chat = await fastify.prisma.chat.findFirst({
          where: { hashId, userHashId: user.hashId || null },
          select: {
            hashId: true,
            userHashId: true,
            _count: { select: { apis: true, posts: true } },
            posts: {
              select: {
                _count: {
                  select: {
                    likes: { where: { isLiked: true } },
                  },
                },
              },
            },
            systemMessage: true,
            contents: {
              select: {
                hashId: true,
                model: { select: { hashId: true, name: true } },
                role: true,
                content: true,
                config: true,
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

        const { _count, posts, createdAt, contents, ...rest } = chat;
        return {
          ...rest,
          contents: contents.map((c) => getTypedContent(c)),
          isApi: _count.apis > 0,
          isPost: _count.posts > 0,
          createdAt: getDateString(createdAt),
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
        userHashId: user.hashId,
        isApi: false,
        isPost: false,
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
          where: { hashId },
          select: { userHashId: true },
        });
        if (!chat || (chat.userHashId && chat.userHashId !== user.hashId)) {
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
  fastify.post<{ Params: Static<typeof ParamSchema> }>(
    "/duplicate/:hashId",
    { schema: { params: ParamSchema } },
    async (request, reply): Promise<ChatDuplicateResponse> => {
      try {
        const { user } = await fastify.getUser(request, reply);
        const { hashId } = request.params;

        const oldChat = await fastify.prisma.chat.findFirst({
          where: { hashId },
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
        if (!oldChat) {
          throw fastify.httpErrors.badRequest("chat is not available.");
        }
        const newChat = await createChat(fastify.prisma.chat, {
          userHashId: user.hashId,
          ...oldChat,
        });
        return newChat;
      } catch (ex) {
        console.error(
          "path: /chat/duplicate/:hashId, method: post, error:",
          ex
        );
        throw ex;
      }
    }
  );
}
