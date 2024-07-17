import fp from "fastify-plugin";
import { FastifyInstance, FastifyPluginAsync } from "fastify";
import cookie, { CookieSerializeOptions } from "@fastify/cookie";

declare module "fastify" {
  interface FastifyRequest {
    cookies: { [cookieName: string]: string | undefined };
  }

  interface FastifyReply {
    setCookie: setCookieWrapper;
    clearCookie: (name: string, options?: CookieSerializeOptions) => this;
  }
}

const cookiePlugin: FastifyPluginAsync = fp(
  async (fastify: FastifyInstance) => {
    fastify.register(cookie, { secret: process.env.COOKIE_SECRET });
  }
);

export default cookiePlugin;
