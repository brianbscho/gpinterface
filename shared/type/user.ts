import { Type } from "@sinclair/typebox";

interface UserInfo {
  hashId: string;
  name: string;
  bio: string;
}

interface UserMe {
  hashId: string;
  email: string;
  name: string;
  bio: string;
  notification: boolean;
}

export interface User {
  hashId: string;
  name: string;
}

export const UserCreateSchema = Type.Object({
  email: Type.String(),
  name: Type.String(),
  password: Type.String(),
  chatHashId: Type.Union([Type.String(), Type.Null()]),
});
export const UserGetSchema = Type.Object({
  hashId: Type.String(),
});
export const UserUpdateSchema = Type.Object({
  name: Type.String(),
});
export const UserLoginSchema = Type.Object({
  email: Type.String(),
  password: Type.String(),
});
export const UserUpdatePasswordSchema = Type.Object({
  oldPassword: Type.String(),
  newPassword: Type.String(),
  newPasswordRepeat: Type.String(),
});

export type UserGetResponse = { user: UserInfo };
export type UserGetMeResponse = { user: UserMe };

export const UserGoogleSchema = Type.Object({
  access_token: Type.String(),
  chatHashId: Type.Union([Type.String(), Type.Null()]),
});
