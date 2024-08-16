import { FastifyInstance } from "fastify";
import { Static } from "@sinclair/typebox";
import { getDateString } from "../util/string";
import { QueryParamSchema } from "gpinterface-shared/type";
import { getIdByHashId } from "../util/prisma";
import {
  CommentsGetResponse,
  CommentsGetSchema,
} from "gpinterface-shared/type/comment";

export default async function (fastify: FastifyInstance) {
  fastify.get<{
    Params: Static<typeof CommentsGetSchema>;
    Querystring: Static<typeof QueryParamSchema>;
  }>(
    "/:postHashId",
    { schema: { params: CommentsGetSchema, querystring: QueryParamSchema } },
    async (request, reply): Promise<CommentsGetResponse> => {
      try {
        const { postHashId } = request.params;
        const { lastHashId } = request.query;

        const id = await getIdByHashId(
          fastify.prisma.comment.findFirst,
          lastHashId
        );

        const comments = await fastify.prisma.comment.findMany({
          where: { ...(id > 0 && { id: { gt: id } }), postHashId },
          select: {
            hashId: true,
            comment: true,
            user: {
              select: {
                hashId: true,
                name: true,
              },
            },
            createdAt: true,
          },
          orderBy: { id: "asc" },
          take: 20,
        });

        return {
          comments: comments.map((c) => ({
            ...c,
            createdAt: getDateString(c.createdAt),
          })),
        };
      } catch (ex) {
        console.error(
          "path: /comments/:postHashId?lastHashId, method: get, error:",
          ex
        );
        throw ex;
      }
    }
  );
}
