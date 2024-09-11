import { create } from "zustand";

type LoginState = {
  message: string;
  setMessage: (message: string) => void;
  setOpen: (open: boolean) => void;
};

const useLoginStore = create<LoginState>((set) => {
  return {
    message: "",
    setMessage: (message: string) => set({ message }),
    setOpen: (open: boolean) => {
      if (open) {
        set({ message: "Please log in first :)" });
      } else {
        set({ message: "" });
      }
    },
  };
});

export default useLoginStore;
