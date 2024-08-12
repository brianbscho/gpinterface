import { FastifyInstance } from "fastify";
import { Static } from "@sinclair/typebox";
import { QueryParamSchema } from "gpinterface-shared/type";
import { getIdByHashId } from "../util/prisma";
import {
  ContentsGetResponse,
  ContentsGetSchema,
} from "gpinterface-shared/type/content";
import { getTypedContent } from "../util/content";

export default async function (fastify: FastifyInstance) {
  fastify.get<{
    Params: Static<typeof ContentsGetSchema>;
    Querystring: Static<typeof QueryParamSchema>;
  }>(
    "/:chatHashId",
    { schema: { params: ContentsGetSchema, querystring: QueryParamSchema } },
    async (request, reply): Promise<ContentsGetResponse> => {
      try {
        const { user } = await fastify.getUser(request, reply);
        const { lastHashId } = request.query;
        const { chatHashId } = request.params;

        const id = await getIdByHashId(
          fastify.prisma.chatContent.findFirst,
          lastHashId
        );

        const contents = await fastify.prisma.chatContent.findMany({
          where: {
            ...(id > 0 && { id: { lt: id } }),
            chat: { hashId: chatHashId, userHashId: user.hashId },
          },
          select: {
            hashId: true,
            model: {
              select: { providerHashId: true, hashId: true },
            },
            role: true,
            content: true,
            config: true,
          },
          orderBy: { id: "desc" },
          take: 20,
        });

        return {
          contents: contents
            .map((c) => {
              const { model, ...content } = c;
              return {
                ...getTypedContent(content),
                providerHashId: model.providerHashId,
                modelHashId: model.hashId,
              };
            })
            .reverse(),
        };
      } catch (ex) {
        console.error("path: /contents:chatHashId, method: get, error:", ex);
        throw ex;
      }
    }
  );
}
