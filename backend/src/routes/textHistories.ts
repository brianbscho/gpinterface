import { FastifyInstance } from "fastify";
import { Static } from "@sinclair/typebox";
import { getDateString } from "../util/string";
import { QueryParamSchema } from "gpinterface-shared/type";
import { getIdByHashId } from "../util/prisma";
import { TextHistoriesGetResponse } from "gpinterface-shared/type/textHistory";

export default async function (fastify: FastifyInstance) {
  fastify.get<{ Querystring: Static<typeof QueryParamSchema> }>(
    "/",
    { schema: { querystring: QueryParamSchema } },
    async (request, reply): Promise<TextHistoriesGetResponse> => {
      try {
        const { user } = await fastify.getUser(request, reply);
        const { lastHashId } = request.query;

        const id = await getIdByHashId(
          fastify.prisma.textPromptHistory.findFirst,
          lastHashId
        );

        const textHistories = await fastify.prisma.textPromptHistory.findMany({
          where: { userHashId: user.hashId, ...(id > 0 && { id: { lt: id } }) },
          select: {
            hashId: true,
            provider: true,
            model: true,
            systemMessage: true,
            config: true,
            input: true,
            content: true,
            response: true,
            inputTokens: true,
            outputTokens: true,
            messages: true,
            createdAt: true,
            price: true,
          },
          orderBy: { id: "desc" },
          take: 20,
        });

        return {
          textHistories: textHistories.map((h) => {
            const { input, response, createdAt, config, messages, ...history } =
              h;
            return {
              ...history,
              input: input as any,
              response: response as any,
              config: config as any,
              messages: messages as any,
              createdAt: getDateString(createdAt),
            };
          }),
        };
      } catch (ex) {
        console.error(
          "path: /text/histories?lastHashId, method: get, error:",
          ex
        );
        throw ex;
      }
    }
  );
}
