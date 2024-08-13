import { Model, Provider } from ".";

export type ProviderType = {
  hashId: string;
  type: string;
  providers: (Provider & { models: Model[] })[];
};
export type ProviderTypesGetResponse = {
  providerTypes: ProviderType[];
};
