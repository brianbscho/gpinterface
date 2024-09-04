import {
  Model,
  ProviderTypesGetResponse,
} from "gpinterface-shared/type/providerType";
import { create } from "zustand";

export type ConfigType<T extends object = { [key: string]: any }> = T;
type ModelState = {
  modelHashId?: string;
  config: ConfigType;
  providerTypes: ProviderTypesGetResponse;
};
type SetModelState = {
  setModelHashId: (modelHashId: string) => void;
  setConfig: (config: ConfigType) => void;
  setProviderTypes: (providerTypes: ProviderTypesGetResponse) => void;
};

const useModelStore = create<
  ModelState & SetModelState & { models: Model[]; model: Model | undefined }
>((set) => {
  return {
    modelHashId: undefined,
    config: {},
    providerTypes: [],
    models: [],
    model: undefined,
    setModelHashId: (modelHashId: string) =>
      set((state) => {
        const model = state.models.find((m) => m.hashId === modelHashId);
        return { modelHashId, model };
      }),
    setConfig: (config: ConfigType) => set({ config }),
    setProviderTypes: (providerTypes: ProviderTypesGetResponse) => {
      set((state) => {
        const models = providerTypes
          .flatMap((type) => type.providers)
          .flatMap((provider) => provider.models);
        const model = models.find((m) => m.hashId === state.modelHashId);
        return { providerTypes, models, model };
      });
    },
  };
});

export default useModelStore;
