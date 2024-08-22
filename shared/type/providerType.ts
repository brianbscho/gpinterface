interface Config {
  hashId: string;
  name: string;
  type: string;
  description: string;
  default?: string | null;
  min?: number | null;
  max?: number | null;
}

interface ConfigOption {
  hashId: string;
  value: string;
}

export type Model = {
  hashId: string;
  name: string;
  inputPricePerMillion: number;
  outputPricePerMillion: number;
  isFree: boolean;
  isLoginRequired: boolean;
  isAvailable: boolean;
} & { configs: (Config & { options: ConfigOption[] })[] };

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
