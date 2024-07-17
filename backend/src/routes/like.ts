import { FastifyInstance } from "fastify";
import { Static } from "@sinclair/typebox";
import { createEntity } from "../util/prisma";
import {
  LikeUpdateResponse,
  LikeUpdateSchema,
} from "gpinterface-shared/type/like";
import { isAccessible } from "../util/thread";

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
          select: { thread: { select: { isPublic: true, userHashId: true } } },
        });
        if (!post) {
          throw httpErrors.badRequest("The post is not available.");
        }
        isAccessible(post.thread, user);

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
