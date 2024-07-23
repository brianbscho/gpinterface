import { FastifyInstance } from "fastify";
import { getDateString } from "../util/string";
import { NotificationsGetResponse } from "gpinterface-shared/type/notification";
import { QueryParamSchema } from "gpinterface-shared/type";
import { Static } from "@sinclair/typebox";
import { getIdByHashId } from "../util/prisma";

export default async function (fastify: FastifyInstance) {
  fastify.get<{ Querystring: Static<typeof QueryParamSchema> }>(
    "/",
    { schema: { querystring: QueryParamSchema } },
    async (request, reply): Promise<NotificationsGetResponse> => {
      try {
        const { user } = await fastify.getUser(request, reply);
        const { lastHashId } = request.query;

        await fastify.prisma.user.update({
          where: { hashId: user.hashId },
          data: { notificationCheckedAt: new Date() },
        });

        const id = await getIdByHashId(
          fastify.prisma.notification.findFirst,
          lastHashId
        );
        const notifications = await fastify.prisma.notification.findMany({
          where: { userHashId: user.hashId, ...(id > 0 && { id: { lt: id } }) },
          select: { hashId: true, message: true, url: true, createdAt: true },
          orderBy: { id: "desc" },
        });
        return {
          notifications: notifications.map((n) => ({
            ...n,
            createdAt: getDateString(n.createdAt),
          })),
        };
      } catch (ex) {
        console.error("path: /notifications, method: get, error:", ex);
        throw ex;
      }
    }
  );
  fastify.delete(
    "/",
    async (request, reply): Promise<NotificationsGetResponse> => {
      try {
        const { user } = await fastify.getUser(request, reply);

        await fastify.prisma.notification.deleteMany({
          where: { userHashId: user.hashId },
        });
        return { notifications: [] };
      } catch (ex) {
        console.error("path: /comment, method: delete, error:", ex);
        throw ex;
      }
    }
  );
}
