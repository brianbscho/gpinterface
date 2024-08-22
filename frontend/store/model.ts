import { Model } from "gpinterface-shared/type/providerType";
import { create } from "zustand";

export type ConfigType<T extends object = { [key: string]: any }> = T;
type ModelState = {
  config: ConfigType;
  modelHashId?: string;
  models: Model[];
};
type SetModelState = {
  setModelStore: (content: Partial<ModelState>) => void;
};

const useModelStore = create<
  ModelState & SetModelState & { model: Model | undefined }
>((set) => {
  return {
    config: {},
    modelHashId: undefined,
    models: [],
    model: undefined,
    setModelStore: (content: Partial<ModelState>) => {
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

export default useModelStore;
