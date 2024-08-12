import { Config, ConfigOption, Model, Provider } from ".";

export type ProviderType = {
  hashId: string;
  type: string;
  providers: (Provider & {
    models: (Model & {
      configs: (Config & {
        options: ConfigOption[];
      })[];
    })[];
  })[];
};
export type ProviderTypesGetResponse = {
  providerTypes: ProviderType[];
};
