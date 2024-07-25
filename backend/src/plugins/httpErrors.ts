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

    fastify.setErrorHandler((error, request, reply) => {
      const message =
        typeof error === "string"
          ? error
          : error.message || "Internal Server Error";
      reply.status(error.statusCode || 500).send({ message });
    });
  }
);

export default httpErrorsPlugin;
