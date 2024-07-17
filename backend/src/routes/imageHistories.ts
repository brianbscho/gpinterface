import { FastifyInstance } from "fastify";
import { Static } from "@sinclair/typebox";
import { getDateString } from "../util/string";
import { QueryParamSchema } from "gpinterface-shared/type";
import { getIdByHashId } from "../util/prisma";
import { ImageHistoriesGetResponse } from "gpinterface-shared/type/imageHistory";

export default async function (fastify: FastifyInstance) {
  fastify.get<{ Querystring: Static<typeof QueryParamSchema> }>(
    "/",
    { schema: { querystring: QueryParamSchema } },
    async (request, reply): Promise<ImageHistoriesGetResponse> => {
      try {
        const { user } = await fastify.getUser(request, reply);
        const { lastHashId } = request.query;

        const id = await getIdByHashId(
          fastify.prisma.imagePromptHistory.findFirst,
          lastHashId
        );

        const imageHistories = await fastify.prisma.imagePromptHistory.findMany(
          {
            where: {
              userHashId: user.hashId,
              ...(id > 0 && { id: { gt: id } }),
            },
            select: {
              hashId: true,
              provider: true,
              model: true,
              prompt: true,
              config: true,
              input: true,
              url: true,
              response: true,
              price: true,
              createdAt: true,
            },
            orderBy: { id: "asc" },
            take: 20,
          }
        );

        return {
          imageHistories: imageHistories.map((h) => {
            const { input, response, createdAt, config, ...history } = h;
            return {
              ...history,
              input: input as any,
              response: response as any,
              config: config as any,
              createdAt: getDateString(createdAt),
            };
          }),
        };
      } catch (ex) {
        console.error(
          "path: /image/histories?lastHashId, method: get, error:",
          ex
        );
        throw ex;
      }
    }
  );
}
