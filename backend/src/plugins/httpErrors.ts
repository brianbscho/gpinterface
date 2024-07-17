import fp from "fastify-plugin";
import { FastifyInstance, FastifyPluginAsync } from "fastify";
import sensible, { HttpErrors } from "@fastify/sensible";

declare module "fastify" {
  interface FastifyInstance {
    httpErrors: HttpErrors;
  }
}

const httpErrorsPlugin: FastifyPluginAsync = fp(
  async (fastify: FastifyInstance) => {
    fastify.register(sensible);

    fastify.addHook("onError", (request, reply, error) => {
      reply
        .status(error.statusCode || 500)
        .send({ msg: error.message || "Internal Server Error" });
    });
  }
);

export default httpErrorsPlugin;
