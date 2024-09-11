import { UserGetMeResponse } from "gpinterface-shared/type/user";
import { create } from "zustand";

type UserState = {
  user: UserGetMeResponse | undefined;
  setUser: (u: UserGetMeResponse | undefined) => void;
};

const useUserStore = create<UserState>((set) => {
  return {
    user: undefined,
    setUser: (user: UserGetMeResponse | undefined) => set({ user }),
  };
});

export default useUserStore;
