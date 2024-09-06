import Fastify from "fastify";
import cors from "@fastify/cors";

import cookiePlugin from "./plugins/cookie";
import httpErrorsPlugin from "./plugins/httpErrors";
import jwtPlugin from "./plugins/jwt";
import prismaPlugin from "./plugins/prisma";

import user from "./routes/user";
import apiKeys from "./routes/apiKeys";
import gpis from "./routes/gpis";
import chat from "./routes/chat";
import chatContents from "./routes/chatContents";
import histories from "./routes/histories";
import providerTypes from "./routes/providerTypes";
import session from "./routes/session";

const fastify = Fastify({
  logger: {
    level: "info",
    serializers: {
      req(request) {
        return {
          body: request.body,
          hostname: request.hostname,
          ip: request.ip,
          method: request.method,
          url: request.url,
          params: request.params,
        };
      },
      res(response) {
        return { statusCode: response.statusCode };
      },
    },
  },
});

fastify.register(cookiePlugin);
fastify.register(httpErrorsPlugin);
fastify.register(jwtPlugin);
fastify.register(prismaPlugin);

fastify.get("/health", () => true);
fastify.register(apiKeys, { prefix: "/api/keys" });
fastify.register(chat, { prefix: "/chat" });
fastify.register(chatContents, { prefix: "/chat/contents" });
fastify.register(gpis, { prefix: "/gpis" });
fastify.register(histories, { prefix: "/histories" });
fastify.register(providerTypes, { prefix: "/provider/types" });
fastify.register(session, { prefix: "/session" });
fastify.register(user, { prefix: "/user" });

const start = async () => {
  try {
    const { CLIENT_URL, PORT } = process.env;

    await fastify.register(cors, {
      origin: CLIENT_URL,
      credentials: true,
      preflightContinue: true,
      maxAge: 86400,
    });

    const port = parseInt(PORT || "3000", 10);
    await fastify.listen({ port, host: "0.0.0.0" });

    console.log(`Server running on ${fastify.listeningOrigin}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
