import { Type } from "@sinclair/typebox";

export const ApiKeyDeleteSchema = Type.Object({ hashId: Type.String() });
export type ApiKeyDeleteResponse = { hashId: string };

type ApiKey = { hashId: string; key: string };
export type ApiKeyCreateResponse = ApiKey;
export type ApiKeysGetResponse = ApiKey[];
