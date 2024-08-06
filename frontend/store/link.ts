import { create } from "zustand";

type Message = string | undefined;
type LinkState = {
  confirmMessage: Message;
  setConfirmMessage: (m: Message) => void;
};

const useLinkStore = create<LinkState>((set) => ({
  confirmMessage: undefined,
  setConfirmMessage: (m: Message) => set({ confirmMessage: m }),
}));

export default useLinkStore;
