import { Type } from "@sinclair/typebox";

export interface Content {
  hashId: string;

  model: { hashId: string; name: string };
  role: string;
  content: string;
  config?: object | null;
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
} & { configs: (Config & { options: ConfigOption[] })[] };

export interface User {
  hashId: string;
  name: string;
}

export const QueryParamSchema = Type.Object({
  lastHashId: Type.Optional(Type.String()),
});
export const ParamSchema = Type.Object({
  hashId: Type.String(),
});
