import { FastifyInstance } from "fastify";
import {
  ChatCompletionSchema,
  ChatCompletionResponse,
} from "gpinterface-shared/type/chat";
import { Static } from "@sinclair/typebox";
import { createChatCompletion } from "../../chat/controllers/chat";
import { GpiHashIdParam } from "gpinterface-shared/type";

export default async function (fastify: FastifyInstance) {
  fastify.post<{
    Params: Static<typeof GpiHashIdParam>;
    Body: Static<typeof ChatCompletionSchema>;
  }>(
    "/:gpiHashId/completion",
    { schema: { params: GpiHashIdParam, body: ChatCompletionSchema } },
    async (request, reply): Promise<ChatCompletionResponse> => {
      try {
        const { user } = await fastify.getUser(request, reply, true);
        const { gpiHashId } = request.params;
        const { content } = request.body;
        if (content.trim() === "") {
          throw fastify.httpErrors.badRequest("Empty content");
        }

        return createChatCompletion({
          fastify,
          gpiHashId,
          content,
          userHashId: user.hashId || null,
        });
      } catch (ex) {
        console.error(
          "path: /chat/:gpiHashId/completion, method: post, error:",
          ex
        );
        throw ex;
      }
    }
  );
}
