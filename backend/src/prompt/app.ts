import Fastify from "fastify";
import cors from "@fastify/cors";

import httpErrorsPlugin from "../plugins/httpErrors";
import prismaPlugin from "../plugins/prisma";

import text from "./text";
import image from "./image";

const fastify = Fastify({ logger: true });

fastify.register(httpErrorsPlugin);
fastify.register(prismaPlugin);

fastify.get("/health", () => true);
fastify.register(image, { prefix: "/image" });
fastify.register(text, { prefix: "/text" });

const start = async () => {
  try {
    await fastify.register(cors, { origin: true });
    const port = parseInt(process.env.PORT || "3001", 10);
    await fastify.listen({ port, host: "0.0.0.0" });
    console.log(`Server running on ${fastify.listeningOrigin}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
