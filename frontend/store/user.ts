import { UserGetMeResponse } from "gpinterface-shared/type/user";
import { create } from "zustand";

type UserType = UserGetMeResponse["user"];
type OptionalUserMe = Partial<Pick<UserType, "name" | "bio" | "notification">>;
type UserState = {
  user: UserType | undefined;
  isLoggedOut: boolean;
  setUser: (u: UserType | undefined) => void;
  setUserProperty: (u: OptionalUserMe) => void;
};

const useUserStore = create<UserState>((set) => {
  return {
    user: undefined,
    isLoggedOut: false,
    setUser: (user: UserType | undefined) => {
      set({ user, isLoggedOut: !user });
    },
    setUserProperty: (u: OptionalUserMe) => {
      set((state) => {
        if (!state.user) return state;

        return { ...state, user: { ...state.user, ...u } };
      });
    },
  };
});

export default useUserStore;
