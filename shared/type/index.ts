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
  likes: number;
  comments: number;

  systemMessage: string;
  messages: { hashId: string; role: string; content: string }[];
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

  providerHashId?: string | null;
  modelHashId?: string | null;
  role: string;
  content: string;
  config: object;
}

// * * * * * * * * * * * *
// Thread
//
export interface Post {
  hashId: string;
  title: string;
  post: string;
  createdAt: string;

  isBookmarked: boolean;
  isLiked: boolean;
  likes: number;

  chat: {
    hashId: string;
    systemMessage: string;
    contents: Content[];
  };

  user?: User | null | undefined;
}

// * * * * * * * * * * * *
// Image Prompt
//

export interface ImageExample {
  hashId: string;
  input: object;
  url: string;
  response: object;
  price: number;
}

export interface ImagePrompt {
  hashId: string;
  provider: string;
  model: string;
  prompt: string;
  config: object;

  examples: ImageExample[];
}

export interface ImagePromptHistory {
  hashId: string;
  imagePromptHashId: string | null;
  provider: string;
  model: string;
  prompt: string;
  config: object;
  input: object;
  url: string;
  response: object;
  price: number;
  createdAt: string;
}

// * * * * * * * * * * * *
// Text Prompt
//

export interface TextExample {
  hashId: string;
  input: object;
  content: string;
  response: object;
  price: number;
}

export interface TextMessage {
  hashId: string;
  role: string;
  content: string;
}

export interface TextPrompt {
  hashId: string;
  provider: string;
  model: string;
  systemMessage: string;
  config: object;

  examples: TextExample[];
  messages: TextMessage[];
}

export interface TextPromptHistory {
  hashId: string;
  textPromptHashId: string | null;
  input: object;
  content: string;
  response: object;
  inputTokens: number;
  outputTokens: number;
  provider: string;
  model: string;
  systemMessage: string;
  config: object;
  messages: object;
  price: number;
  createdAt: string;
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
