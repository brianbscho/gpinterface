import { Content } from "gpinterface-shared/type";
import { create } from "zustand";

export type ConfigType<T extends object = { [key: string]: any }> = T;
type ContentState = Partial<Omit<Content, "role" | "content" | "config">> & {
  config: ConfigType;
} & { refreshingHashId?: string } & {
  setContentStore: (content: Partial<ContentState>) => void;
};

const useContentStore = create<ContentState>((set) => {
  return {
    hashId: undefined,
    model: undefined,
    config: {},
    refreshingHashId: undefined,
    setContentStore: (content: Partial<ContentState>) => {
      set((state) => ({
        ...state,
        ...content,
        config: content.config || state.config,
      }));
    },
  };
});

export default useContentStore;
