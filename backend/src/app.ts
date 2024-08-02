import Fastify from "fastify";
import cors from "@fastify/cors";

import cookiePlugin from "./plugins/cookie";
import httpErrorsPlugin from "./plugins/httpErrors";
import jwtPlugin from "./plugins/jwt";
import prismaPlugin from "./plugins/prisma";

import user from "./routes/user";
import apiKey from "./routes/apiKey";
import apiKeys from "./routes/apiKeys";
import like from "./routes/like";
import post from "./routes/post";
import posts from "./routes/posts";
import textPrompt from "./routes/textPrompt";
import thread from "./routes/thread";
import threads from "./routes/threads";
import bookmark from "./routes/bookmark";
import textHistories from "./routes/textHistories";
import imagePrompt from "./routes/imagePrompt";
import imageHistories from "./routes/imageHistories";
import notifications from "./routes/notifications";
import bookmarks from "./routes/bookmarks";

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
fastify.register(apiKey, { prefix: "/api/key" });
fastify.register(apiKeys, { prefix: "/api/keys" });
fastify.register(bookmark, { prefix: "/bookmark" });
fastify.register(bookmarks, { prefix: "/bookmarks" });
fastify.register(imageHistories, { prefix: "/image/histories" });
fastify.register(imagePrompt, { prefix: "/image/prompt" });
fastify.register(like, { prefix: "/like" });
fastify.register(notifications, { prefix: "/notifications" });
fastify.register(post, { prefix: "/post" });
fastify.register(posts, { prefix: "/posts" });
fastify.register(textHistories, { prefix: "/text/histories" });
fastify.register(textPrompt, { prefix: "/text/prompt" });
fastify.register(thread, { prefix: "/thread" });
fastify.register(threads, { prefix: "/threads" });
fastify.register(user, { prefix: "/user" });

const start = async () => {
  try {
    const { CLIENT_URL, PORT } = process.env;

    await fastify.register(cors, { origin: CLIENT_URL, credentials: true });

    const port = parseInt(PORT || "3000", 10);
    await fastify.listen({ port, host: "0.0.0.0" });

    console.log(`Server running on ${fastify.listeningOrigin}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
