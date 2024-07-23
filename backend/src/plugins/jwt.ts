import fp from "fastify-plugin";
import {
  FastifyInstance,
  FastifyPluginAsync,
  FastifyReply,
  FastifyRequest,
} from "fastify";
import { Payload } from "../types/jwt";
import { verify } from "jsonwebtoken";

declare module "fastify" {
  interface FastifyInstance {
    getUser: (
      request: FastifyRequest,
      reply: FastifyReply,
      optional?: boolean
    ) => Promise<Payload>;
  }
}

const jwtPlugin: FastifyPluginAsync = fp(async (fastify: FastifyInstance) => {
  fastify.decorate(
    "getUser",
    async function (
      request: FastifyRequest,
      reply: FastifyReply,
      optional?: boolean
    ): Promise<Payload> {
      try {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
          throw reply
            .status(500)
            .send({ msg: "server error - missing secret" });
        }
        const token =
          request.cookies.access_token ||
          request.headers.authorization?.slice("Bearer ".length);
        if (!token) {
          throw { msg: "Session has expired. Please login again." };
        }

        const payload = (await verify(token, secret)) as Payload;
        return payload;
      } catch (ex) {
        if (optional) return { user: { hashId: "", name: "" } };
        throw reply.status(500).send(ex);
      }
    }
  );
});

export default jwtPlugin;
