import { Type } from "@sinclair/typebox";

export const QueryParamSchema = Type.Object({
  lastHashId: Type.Optional(Type.String()),
});
export const ParamSchema = Type.Object({
  hashId: Type.String(),
});
export const SearchQueryParamSchema = Type.Object({
  keyword: Type.String(),
  lastHashId: Type.Optional(Type.String()),
});
export type DeleteResponse = {
  success: boolean;
};
