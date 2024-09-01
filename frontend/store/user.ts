import { UserGetMeResponse } from "gpinterface-shared/type/user";
import { create } from "zustand";

type UserType = UserGetMeResponse["user"];
type UserState = {
  user: UserType | undefined;
  isLoggedOut: boolean;
  setUser: (u: UserType | undefined) => void;
};

const useUserStore = create<UserState>((set) => {
  return {
    user: undefined,
    isLoggedOut: false,
    setUser: (user: UserType | undefined) => {
      set({ user, isLoggedOut: !user });
    },
  };
});

export default useUserStore;
