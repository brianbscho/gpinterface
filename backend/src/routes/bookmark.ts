import { FastifyInstance } from "fastify";
import { Static } from "@sinclair/typebox";
import { createEntity } from "../util/prisma";
import {
  BookmarkUpdateResponse,
  BookmarkUpdateSchema,
} from "gpinterface-shared/type/bookmark";

export default async function (fastify: FastifyInstance) {
  const { httpErrors } = fastify;

  fastify.put<{ Body: Static<typeof BookmarkUpdateSchema> }>(
    "/",
    { schema: { body: BookmarkUpdateSchema } },
    async (request, reply): Promise<BookmarkUpdateResponse> => {
      try {
        const { user } = await fastify.getUser(request, reply);
        const { postHashId, isBookmarked } = request.body;

        const post = await fastify.prisma.post.findFirst({
          where: { hashId: postHashId },
          select: { hashId: true },
        });
        if (!post) {
          throw httpErrors.badRequest("The post is not available.");
        }

        const bookmarkEntry = await fastify.prisma.bookmark.findFirst({
          where: { userHashId: user.hashId, postHashId },
          select: { hashId: true },
        });
        if (bookmarkEntry) {
          await fastify.prisma.bookmark.update({
            where: { hashId: bookmarkEntry.hashId },
            data: { isBookmarked },
          });
        } else {
          await createEntity(fastify.prisma.bookmark.create, {
            data: { isBookmarked, userHashId: user.hashId, postHashId },
            select: { hashId: true },
          });
        }
        return { isBookmarked };
      } catch (ex) {
        console.error("path: /bookmark, method: put, error:", ex);
        throw ex;
      }
    }
  );
}
