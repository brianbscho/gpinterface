import { FastifyInstance } from "fastify";
import { Static } from "@sinclair/typebox";
import { createEntity } from "../util/prisma";
import {
  LikeUpdateResponse,
  LikeUpdateSchema,
} from "gpinterface-shared/type/like";

export default async function (fastify: FastifyInstance) {
  const { httpErrors } = fastify;

  fastify.put<{ Body: Static<typeof LikeUpdateSchema> }>(
    "/",
    { schema: { body: LikeUpdateSchema } },
    async (request, reply): Promise<LikeUpdateResponse> => {
      try {
        const { user } = await fastify.getUser(request, reply);
        const { postHashId, isLiked } = request.body;

        const post = await fastify.prisma.post.findFirst({
          where: { hashId: postHashId },
          select: { hashId: true, userHashId: true },
        });
        if (!post) {
          throw httpErrors.badRequest("The post is not available.");
        }

        const likeEntry = await fastify.prisma.like.findFirst({
          where: { userHashId: user.hashId, postHashId },
          select: { hashId: true },
        });
        if (likeEntry) {
          await fastify.prisma.like.update({
            where: { hashId: likeEntry.hashId },
            data: { isLiked },
          });
        } else {
          await createEntity(fastify.prisma.like.create, {
            data: { isLiked, userHashId: user.hashId, postHashId },
            select: { hashId: true },
          });

          const { userHashId } = post;
          if (isLiked && userHashId !== null && userHashId !== user.hashId) {
            await createEntity(fastify.prisma.notification.create, {
              data: {
                userHashId,
                message: `${user.name} liked your post!`,
                url: `/posts/${post.hashId}`,
              },
            });
          }
        }

        const likes = await fastify.prisma.like.count({
          where: { isLiked: true, postHashId },
        });
        return { isLiked, likes };
      } catch (ex) {
        console.error("path: /like, method: put, error:", ex);
        throw ex;
      }
    }
  );
}
