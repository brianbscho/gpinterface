import { Type } from "@sinclair/typebox";

type UserMe = {
  hashId: string;
  email: string;
  name: string;
};

export type User = {
  hashId: string;
  name: string;
};

export const UserCreateSchema = Type.Object({
  email: Type.String(),
  name: Type.String(),
  password: Type.String(),
});
export const UserGoogleSchema = Type.Object({
  access_token: Type.String(),
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

export type UserGetMeResponse = UserMe;
