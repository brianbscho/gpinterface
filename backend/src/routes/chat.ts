import { FastifyInstance } from "fastify";
import { createEntity } from "../util/prisma";
import { ChatCreateResponse } from "gpinterface-shared/type/chat";

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
}
