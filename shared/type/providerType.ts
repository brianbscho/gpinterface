import { Model } from ".";

interface Provider {
  hashId: string;
  name: string;
}

type ProviderType = {
  hashId: string;
  type: string;
  providers: (Provider & { models: Model[] })[];
};

export type ProviderTypesGetResponse = { providerTypes: ProviderType[] };
