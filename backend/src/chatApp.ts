import Fastify from "fastify";
import cors from "@fastify/cors";

import httpErrorsPlugin from "./plugins/httpErrors";
import prismaPlugin from "./plugins/prisma";
import chat from "./routes/chat/chat";
import session from "./routes/chat/session";

const fastify = Fastify({ logger: true });

fastify.register(httpErrorsPlugin);
fastify.register(prismaPlugin);

fastify.get("/health", () => true);
fastify.register(chat, { prefix: "/chat" });
fastify.register(session, { prefix: "/session" });

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
