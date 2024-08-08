import { FastifyInstance } from "fastify";
import { createEntity } from "../util/prisma";
import { ChatCreateResponse } from "gpinterface-shared/type/chat";
import { Static } from "@sinclair/typebox";
import { ParamSchema } from "gpinterface-shared/type";
import { createChat } from "../controllers/chat";

export default async function (fastify: FastifyInstance) {
  fastify.post("/", async (request, reply): Promise<ChatCreateResponse> => {
    try {
      const { user } = await fastify.getUser(request, reply);

      const chat = await createEntity(fastify.prisma.chat.create, {
        data: { userHashId: user.hashId },
        select: { hashId: true },
      });
      return chat;
    } catch (ex) {
      console.error("path: /chat, method: post, error:", ex);
      throw ex;
    }
  });
  fastify.post<{ Params: Static<typeof ParamSchema> }>(
    "/duplicate/:hashId",
    { schema: { params: ParamSchema } },
    async (request, reply): Promise<ChatCreateResponse> => {
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
