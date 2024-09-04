type History = {
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
};

export type HistoriesGetResponse = History[];
