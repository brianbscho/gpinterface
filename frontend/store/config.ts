import { create } from "zustand";

export type ConfigType = { [key: string]: string };
type ConfigState = {
  modelHashId: string;
  config: ConfigType;
  setModelHashId: (hashId: string) => void;
  setConfig: (c: ConfigType) => void;
};

const useConfigStore = create<ConfigState>((set) => {
  return {
    modelHashId: "",
    config: {},
    setModelHashId: (hashId: string) => {
      set({ modelHashId: hashId });
    },
    setConfig: (config: ConfigType) => {
      set({ config });
    },
  };
});

export default useConfigStore;
