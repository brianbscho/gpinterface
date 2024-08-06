import { UserMe } from "gpinterface-shared/type";
import { create } from "zustand";

type OptionalUserMe = { name?: string; bio?: string; notification?: boolean };
type UserState = {
  user: UserMe | undefined;
  isLoggedOut: boolean;
  setUser: (u: UserMe | undefined) => void;
  setUserProperty: (u: OptionalUserMe) => void;
};

const useUserStore = create<UserState>((set) => {
  return {
    user: undefined,
    isLoggedOut: false,
    setUser: (user: UserMe | undefined) => {
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
