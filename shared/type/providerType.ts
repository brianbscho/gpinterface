import { Config, ConfigOption, Model, Provider, ProviderType } from ".";

export type ProviderTypesGetResponse = {
  providerTypes: (ProviderType & {
    providers: (Provider & {
      models: (Model & {
        configs: (Config & {
          options: ConfigOption[];
        })[];
      })[];
    })[];
  })[];
};
