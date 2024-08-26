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

  gpiHashId?: string | null;
  chatHashId?: string | null;
  isGpi: boolean;
}

export type HistoriesGetResponse = { histories: History[] };
