interface History {
  hashId: string;
  provider: string;
  model: string;
  config: object;
  messages: object;
  content: string;
  response: object;
  paid: number;
  price: number;
  inputTokens: number;
  outputTokens: number;
  createdAt: string;

  apiHashId?: string | null;
  chatHashId?: string | null;
  isApi: boolean;
}

export type HistoriesGetResponse = { histories: History[] };
