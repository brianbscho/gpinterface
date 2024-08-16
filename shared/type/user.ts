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

export const UserCreateSchema = Type.Object({
  email: Type.String(),
  name: Type.String(),
  password: Type.String(),
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
