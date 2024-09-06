export type ApiKeyDeleteResponse = { hashId: string };

type ApiKey = { hashId: string; key: string };
export type ApiKeyCreateResponse = ApiKey;
export type ApiKeysGetResponse = ApiKey[];
