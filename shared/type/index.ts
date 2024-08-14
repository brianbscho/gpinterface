import { Type } from "@sinclair/typebox";

export interface Api {
  hashId: string;
  description: string;
  chat: { hashId: string; systemMessage: string; contents: Content[] };
}

export interface Chat {
  hashId: string;

  isApi: boolean;
  isPost: boolean;

  systemMessage: string;
  contents: Content[];
  createdAt: string;
}

export interface Comment {
  hashId: string;
  comment: string;
  user?: User | null;
  createdAt: string;
}

export interface Content {
  hashId: string;

  modelHashId: string;
  role: string;
  content: string;
  config?: object | null;
}

export interface History {
  hashId: string;
  provider: string;
  model: string;
  config: object;
  messages: object;
  content: string;
  response: object;
  price: number;
  inputTokens: number;
  outputTokens: number;
  createdAt: string;

  chatHashId?: string | null;
  isApi: boolean;
  isPost: boolean;
}

// * * * * * * * * * * * *
// Chat
//

interface Config {
  hashId: string;
  name: string;
  type: string;
  description: string;
  default?: string | null;
  min?: number | null;
  max?: number | null;
}

interface ConfigOption {
  hashId: string;
  value: string;
}

export type Model = {
  hashId: string;
  name: string;
  inputPricePerMillion: number;
  outputPricePerMillion: number;
  isFree: boolean;
  isLoginRequired: boolean;
  isAvailable: boolean;
} & {
  configs: (Config & {
    options: ConfigOption[];
  })[];
};

export interface Provider {
  hashId: string;
  name: string;
}

// * * * * * * * * * * * *
// Post
//
export interface Post {
  hashId: string;
  title: string;
  post: string;
  createdAt: string;

  isBookmarked: boolean;
  isLiked: boolean;
  likes: number;

  chat: { hashId: string; systemMessage: string; contents: Content[] };

  user?: User | null | undefined;
}

// * * * * * * * * * * * *
// User
//

export interface ApiKey {
  hashId: string;
  key: string;
}

export interface Notification {
  hashId: string;
  message: string;
  url: string;
  createdAt: string;
}

export interface User {
  hashId: string;
  name: string;
}

export interface UserInfo {
  hashId: string;
  name: string;
  bio: string;
}

export interface UserMe {
  hashId: string;
  email: string;
  name: string;
  bio: string;
  notification: boolean;
}

export const QueryParamSchema = Type.Object({
  lastHashId: Type.Optional(Type.String()),
});
export const ParamSchema = Type.Object({
  hashId: Type.String(),
});
