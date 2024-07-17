import { Type } from "@sinclair/typebox";
import { ApiKey } from ".";

export const ApiKeyDeleteSchema = Type.Object({ hashId: Type.String() });
export type ApiKeyDeleteResponse = { hashId: string };
export type ApiKeyCreateResponse = { apiKey: ApiKey };
export type ApiKeysGetResponse = { apiKeys: ApiKey[] };
