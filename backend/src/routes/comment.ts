import { FastifyInstance } from "fastify";
import { Static } from "@sinclair/typebox";
import { createEntity } from "../util/prisma";
import {
  CommentCreateResponse,
  CommentCreateSchema,
} from "gpinterface-shared/type/comment";
import { getDateString } from "../util/string";

export default async function (fastify: FastifyInstance) {
  const { httpErrors } = fastify;

  fastify.post<{ Body: Static<typeof CommentCreateSchema> }>(
    "/",
    { schema: { body: CommentCreateSchema } },
    async (request, reply): Promise<CommentCreateResponse> => {
      try {
        const { user } = await fastify.getUser(request, reply);
        const { postHashId, comment } = request.body;

        if (comment.trim() === "") {
          throw httpErrors.badRequest("comment is empty.");
        }

        const post = await fastify.prisma.post.findFirst({
          where: { hashId: postHashId },
          select: { hashId: true },
        });
        if (!post) {
          throw httpErrors.badRequest("post is not available.");
        }

        const newComment = await createEntity(fastify.prisma.comment.create, {
          data: { postHashId, comment, userHashId: user.hashId },
          select: { hashId: true, createdAt: true },
        });

        return {
          comment: {
            hashId: newComment.hashId,
            createdAt: getDateString(newComment.createdAt),
            comment,
            user,
          },
        };
      } catch (ex) {
        console.error("path: /comment, method: post, error:", ex);
        throw ex;
      }
    }
  );
}
