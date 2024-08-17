import { Model } from "gpinterface-shared/type";
import { create } from "zustand";

export type ConfigType<T extends object = { [key: string]: any }> = T;
type ContentState = {
  hashId?: string;
  refreshingHashId?: string;
  config: ConfigType;
  modelHashId?: string;
  models: Model[];
};
type SetContentState = {
  setContentStore: (content: Partial<ContentState>) => void;
};

const useContentStore = create<
  ContentState & SetContentState & { model: Model | undefined }
>((set) => {
  return {
    hashId: undefined,
    refreshingHashId: undefined,
    config: {},
    modelHashId: undefined,
    models: [],
    model: undefined,
    setContentStore: (content: Partial<ContentState>) => {
      set((state) => ({
        ...state,
        ...content,
        model: state.models
          .concat(content.models ?? [])
          .find((m) => m.hashId === (content.modelHashId || state.modelHashId)),
      }));
    },
  };
});

export default useContentStore;
