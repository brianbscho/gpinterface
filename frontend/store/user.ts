import { UserMe } from "gpinterface-shared/type";
import { create } from "zustand";

type OptionalUserMe = { name?: string; bio?: string };
type UserState = {
  user: UserMe | undefined;
  setUser: (u: UserMe | undefined) => void;
  setUserProperty: (u: OptionalUserMe) => void;
};

const useUserStore = create<UserState>((set) => {
  return {
    user: undefined,
    setUser: (u: UserMe | undefined) => {
      set({ user: u });
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
