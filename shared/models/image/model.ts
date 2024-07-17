import { stabilityAiModels } from "./stability.ai";
import { modelsLabAiModels } from "./modelslab";

export const imageModels = [
  { provider: "None", models: [] },
  { provider: "Stability AI", models: stabilityAiModels },
  { provider: "ModelsLab", models: modelsLabAiModels },
];
