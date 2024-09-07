import { Type } from "@sinclair/typebox";

export const HashIdParam = Type.Object({ hashId: Type.String() });
export const GpiHashIdParam = Type.Object({ gpiHashId: Type.String() });
export const SessionHashIdParam = Type.Object({ sessionHashId: Type.String() });

export const LastHashIdParam = Type.Object({
  lastHashId: Type.Optional(Type.String()),
});

export const SearchQueryHashIdParam = Type.Object({
  keyword: Type.String(),
  lastHashId: Type.Optional(Type.String()),
});

export type DeleteResponse = { hashIds: string[] };
