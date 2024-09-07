import Fastify from "fastify";
import cors from "@fastify/cors";

import cookiePlugin from "./plugins/cookie";
import httpErrorsPlugin from "./plugins/httpErrors";
import jwtPlugin from "./plugins/jwt";
import prismaPlugin from "./plugins/prisma";

import users from "./routes/private/users";
import apiKeys from "./routes/private/apiKeys";
import privateGpis from "./routes/private/gpis";
import publicGpis from "./routes/public/gpis";
import chat from "./routes/public/chat";
import chatContents from "./routes/private/chatContents";
import histories from "./routes/private/histories";
import providerTypes from "./routes/public/providerTypes";
import session from "./routes/public/session";

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
fastify.register(privateGpis, { prefix: "/users/gpis" });
fastify.register(publicGpis, { prefix: "/gpis" });
fastify.register(histories, { prefix: "/histories" });
fastify.register(providerTypes, { prefix: "/provider/types" });
fastify.register(session, { prefix: "/session" });
fastify.register(users, { prefix: "/users" });

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
