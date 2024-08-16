import { gptConfig, gptModels } from "./openai";
import { claudeConfig, claudeModels } from "./anthropic";
import { mistralConfig, mistralModels } from "./mistral";
import { commandConfig, commandModels } from "./cohere";
import { jambaConfig, jambaModels } from "./ai21";
import { llamaConfig, llamaModels } from "./meta";
import { gemmaConfig, gemmaModels } from "./google";

export const textModels = [
  { provider: "OpenAI", models: gptModels, config: gptConfig },
  { provider: "Anthropic", models: claudeModels, config: claudeConfig },
  { provider: "Mistral", models: mistralModels, config: mistralConfig },
  { provider: "Cohere", models: commandModels, config: commandConfig },
  { provider: "AI21", models: jambaModels, config: jambaConfig },
  { provider: "Meta", models: llamaModels, config: llamaConfig },
  { provider: "Google", models: gemmaModels, config: gemmaConfig },
];
