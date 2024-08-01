import { stabilityAiModels } from "./stability.ai";
import { modelsLabAiModels } from "./modelslab";

export const imageModels = [
  { provider: "Stability AI", models: stabilityAiModels },
  { provider: "ModelsLab", models: modelsLabAiModels },
];
