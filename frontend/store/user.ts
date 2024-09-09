import { UserGetMeResponse } from "gpinterface-shared/type/user";
import { create } from "zustand";

type UserState = {
  user: UserGetMeResponse | undefined;
  isLoggedOut: boolean;
  setUser: (u: UserGetMeResponse | undefined) => void;
};

const useUserStore = create<UserState>((set) => {
  return {
    user: undefined,
    isLoggedOut: false,
    setUser: (user: UserGetMeResponse | undefined) => {
      set({ user, isLoggedOut: !user });
    },
  };
});

export default useUserStore;
