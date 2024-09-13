import { FastifyInstance } from "fastify";
import { Static } from "@sinclair/typebox";
import {
  DeleteResponse,
  HashIdParam,
  LastHashIdParam,
} from "gpinterface-shared/type";
import {
  GpiCreateResponse,
  GpiCreateSchema,
  GpiDeploySchema,
  GpiGetResponse,
  GpisGetResponse,
  GpiUpdateResponse,
  GpiUpdateSchema,
} from "gpinterface-shared/type/gpi";
import {
  ChatContentCreateSchema,
  ChatContentsCreateResponse,
} from "gpinterface-shared/type/chat-content";
import { GpiService } from "../../services/gpi";
import { ChatContentService } from "../../services/chat-content";

export default async function (fastify: FastifyInstance) {
  const gpiService = new GpiService(fastify);
  const chatContentService = new ChatContentService(fastify);

  fastify.post<{ Body: Static<typeof GpiCreateSchema> }>(
    "/",
    { schema: { body: GpiCreateSchema } },
    async (request, reply): Promise<GpiCreateResponse> => {
      const { user } = await fastify.getUser(request, reply);
      const { modelHashId, config } = request.body;

      return gpiService.create(user.hashId, modelHashId, config);
    }
  );
  fastify.patch<{
    Params: Static<typeof HashIdParam>;
    Body: Static<typeof GpiUpdateSchema>;
  }>(
    "/:hashId",
    { schema: { params: HashIdParam, body: GpiUpdateSchema } },
    async (request, reply): Promise<GpiUpdateResponse> => {
      const { user } = await fastify.getUser(request, reply);
      const { hashId } = request.params;

      return gpiService.patch(hashId, user.hashId, request.body);
    }
  );
  fastify.put<{
    Params: Static<typeof HashIdParam>;
    Body: Static<typeof GpiDeploySchema>;
  }>(
    "/:hashId",
    { schema: { params: HashIdParam, body: GpiDeploySchema } },
    async (request, reply): Promise<GpiCreateResponse> => {
      const { user } = await fastify.getUser(request, reply);
      const { hashId } = request.params;

      return gpiService.put(hashId, user.hashId, request.body);
    }
  );
  fastify.post<{
    Params: Static<typeof HashIdParam>;
    Body: Static<typeof GpiDeploySchema>;
  }>(
    "/:hashId/deploy",
    { schema: { params: HashIdParam, body: GpiDeploySchema } },
    async (request, reply): Promise<GpiCreateResponse> => {
      const { user } = await fastify.getUser(request, reply);
      const { hashId } = request.params;

      return gpiService.deploy(hashId, user.hashId, request.body);
    }
  );
  fastify.post<{ Params: Static<typeof HashIdParam> }>(
    "/:hashId/copy",
    { schema: { params: HashIdParam } },
    async (request, reply): Promise<GpiCreateResponse> => {
      const { user } = await fastify.getUser(request, reply);
      const { hashId } = request.params;

      return gpiService.copy(hashId, user.hashId);
    }
  );
  fastify.delete<{ Params: Static<typeof HashIdParam> }>(
    "/:hashId",
    { schema: { params: HashIdParam } },
    async (request, reply): Promise<DeleteResponse> => {
      const { user } = await fastify.getUser(request, reply);
      const { hashId } = request.params;

      return gpiService.delete(hashId, user.hashId);
    }
  );
  fastify.post<{
    Params: Static<typeof HashIdParam>;
    Body: Static<typeof ChatContentCreateSchema>;
  }>(
    "/:hashId/chat/contents/completion",
    { schema: { params: HashIdParam, body: ChatContentCreateSchema } },
    async (request, reply): Promise<ChatContentsCreateResponse> => {
      const { user } = await fastify.getUser(request, reply);
      const { hashId } = request.params;
      const { modelHashId, config, content } = request.body;

      return chatContentService.createCompletion(
        hashId,
        user.hashId,
        modelHashId,
        config,
        content
      );
    }
  );
  fastify.post<{ Params: Static<typeof HashIdParam> }>(
    "/:hashId/chat/contents",
    { schema: { params: HashIdParam } },
    async (request, reply): Promise<ChatContentsCreateResponse> => {
      const { user } = await fastify.getUser(request, reply);
      const { hashId } = request.params;

      return chatContentService.createEmpty(hashId, user.hashId);
    }
  );
  fastify.get<{ Querystring: Static<typeof LastHashIdParam> }>(
    "/",
    { schema: { querystring: LastHashIdParam } },
    async (request, reply): Promise<GpisGetResponse> => {
      const { user } = await fastify.getUser(request, reply);
      const { lastHashId } = request.query;

      return gpiService.getManyByUserHashId(lastHashId, user.hashId);
    }
  );
  fastify.get<{ Params: Static<typeof HashIdParam> }>(
    "/:hashId",
    { schema: { params: HashIdParam } },
    async (request, reply): Promise<GpiGetResponse> => {
      try {
        // Authenticate and get the user
        const { user } = await fastify.getUser(request, reply);
        const { hashId } = request.params;

        // Use the Service to get the GPI
        return await gpiService.getPrivateGpi(hashId, user.hashId);
      } catch (error) {
        // Log the error
        fastify.log.error(
          { url: request.url, method: request.method, error },
          "Error fetching GPI"
        );

        // Handle known errors
        if (error instanceof Error) {
          throw fastify.httpErrors.badRequest(error.message);
        }

        // Handle unexpected errors
        throw fastify.httpErrors.internalServerError(
          "An unexpected error occurred."
        );
      }
    }
  );
}
