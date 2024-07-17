import { create } from "zustand";

type LinkState = {
  confirmMessage: string | undefined;
  setConfirmMessage: (m: string | undefined) => void;
};

const useLinkStore = create<LinkState>((set) => ({
  confirmMessage: undefined,
  setConfirmMessage: (m: string | undefined) => set({ confirmMessage: m }),
}));

export default useLinkStore;
