type Config = {
  hashId: string;
  name: string;
  type: string;
  description: string;
  default?: string | null;
  min?: number | null;
  max?: number | null;
};

export type Model = {
  hashId: string;
  name: string;
  inputPricePerMillion: number;
  outputPricePerMillion: number;
  isFree: boolean;
  isLoginRequired: boolean;
  isAvailable: boolean;
  configs: {
    config: Config & { options: { hashId: string; value: string }[] };
  }[];
};

type ProviderType = {
  hashId: string;
  type: string;
  providers: { hashId: string; name: string; models: Model[] }[];
};
export type ProviderTypesGetResponse = ProviderType[];
