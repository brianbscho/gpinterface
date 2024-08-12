import { create } from "zustand";

type ConfigState = {
  modelHashId: string;
  config?: object | null;
  setModelHashId: (hashId: string) => void;
  setConfig: (c: object) => void;
};

const useConfigStore = create<ConfigState>((set) => {
  return {
    modelHashId: "",
    config: undefined,
    setModelHashId: (hashId: string) => {
      set({ modelHashId: hashId });
    },
    setConfig: (config: object) => {
      set({ config });
    },
  };
});

export default useConfigStore;
