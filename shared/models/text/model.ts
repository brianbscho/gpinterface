import { gptConfig, gptModels } from "./openai";
import { claudeConfig, claudeModels } from "./anthropic";
import { mistralConfig, mistralModels } from "./mistral";
import { commandConfig, commandModels } from "./cohere";
import { jambaConfig, jambaModels } from "./ai21";
import { llamaConfig, llamaModels } from "./meta";
import { gemmaConfig, gemmaModels } from "./google";

export const textModels = [
  { provider: "None", models: [], config: {} },
  { provider: "OpenAI", models: gptModels, config: gptConfig },
  { provider: "Anthropic", models: claudeModels, config: claudeConfig },
  { provider: "Mistral", models: mistralModels, config: mistralConfig },
  { provider: "Cohere", models: commandModels, config: commandConfig },
  { provider: "AI21", models: jambaModels, config: jambaConfig },
  { provider: "Meta", models: llamaModels, config: llamaConfig },
  { provider: "Google", models: gemmaModels, config: gemmaConfig },
];

const KILO = 1000;
export function getInputTextPriceByModel(input: number, model: string) {
  switch (model) {
    case "gpt-4o-2024-05-13":
      return 5 * input;
    case "gpt-4o-mini-2024-07-18":
      return 0.15 * input;
    case "gpt-4-turbo-2024-04-09":
    case "gpt-4-0125-preview":
      return 10 * input;
    case "gpt-3.5-turbo-0125":
      return 0.5 * input;
    case "claude-3-5-sonnet-20240620":
    case "claude-3-sonnet-20240229":
      return 3 * input;
    case "claude-3-opus-20240229":
      return 15 * input;
    case "claude-3-haiku-20240307":
      return 0.25 * input;
    case "claude-2.1":
    case "claude-2.0":
      return 8 * input;
    case "claude-instant-1.2":
      return 0.8 * input;
    case "open-mistral-nemo-2407":
      return 0.3 * input;
    case "open-mixtral-8x22b-2404":
      return 2 * input;
    case "mistral-large-2407":
      return 3 * input;
    case "mistral-large-2402":
      return 4 * input;
    case "mistral-medium-2312":
      return 2.7 * input;
    case "mistral-small-2402":
      return 1 * input;
    case "mistral-small-2312":
      return 0.7 * input;
    case "mistral-tiny-2312":
      return 0.25 * input;
    case "codestral-mamba-2407":
      return 0.25 * input;
    case "codestral-2405":
      return 1 * input;
    case "command-r-plus":
      return 3.0 * input;
    case "command-r":
      return 0.5 * input;
    case "command":
    case "command-nightly":
      return 1 * input;
    case "command-light":
    case "command-light-nightly":
      return 0.3 * input;
    case "jamba-instruct-preview":
      return 0.5 * input;
    case "meta.llama3-1-70b-instruct-v1:0":
      return 0.00265 * input * KILO;
    case "meta.llama3-1-8b-instruct-v1:0":
      return 0.0003 * input * KILO;
    case "meta.llama3-70b-instruct-v1:0":
      return 0.00265 * input * KILO;
    case "meta.llama3-8b-instruct-v1:0":
      return 0.0003 * input * KILO;
    case "gemma2-9b-it":
      return 0.2 * input;
    case "gemma-7b-it":
      return 0.07 * input;
    default:
      throw "Cannot find price info of the model";
  }
}

export function getOutputTextPriceByModel(output: number, model: string) {
  switch (model) {
    case "gpt-4o-2024-05-13":
      return 15 * output;
    case "gpt-4o-mini-2024-07-18":
      return 0.6 * output;
    case "gpt-4-turbo-2024-04-09":
    case "gpt-4-0125-preview":
      return 30 * output;
    case "gpt-3.5-turbo-0125":
      return 1.5 * output;
    case "claude-3-5-sonnet-20240620":
    case "claude-3-sonnet-20240229":
      return 15 * output;
    case "claude-3-opus-20240229":
      return 75 * output;
    case "claude-3-haiku-20240307":
      return 1.25 * output;
    case "claude-2.1":
    case "claude-2.0":
      return 24 * output;
    case "claude-instant-1.2":
      return 2.4 * output;
    case "open-mistral-nemo-2407":
      return 0.3 * output;
    case "open-mixtral-8x22b-2404":
      return 6 * output;
    case "mistral-large-2407":
      return 9 * output;
    case "mistral-large-2402":
      return 12 * output;
    case "mistral-medium-2312":
      return 8.1 * output;
    case "mistral-small-2402":
      return 3 * output;
    case "mistral-small-2312":
      return 0.7 * output;
    case "mistral-tiny-2312":
      return 0.25 * output;
    case "codestral-mamba-2407":
      return 0.25 * output;
    case "codestral-2405":
      return 3 * output;
    case "command-r-plus":
      return 15.0 * output;
    case "command-r":
      return 1.5 * output;
    case "command":
    case "command-nightly":
      return 2 * output;
    case "command-light":
    case "command-light-nightly":
      return 0.6 * output;
    case "jamba-instruct-preview":
      return 0.7 * output;
    case "meta.llama3-1-70b-instruct-v1:0":
      return 0.0035 * output * KILO;
    case "meta.llama3-1-8b-instruct-v1:0":
      return 0.0006 * output * KILO;
    case "meta.llama3-70b-instruct-v1:0":
      return 0.0035 * output * KILO;
    case "meta.llama3-8b-instruct-v1:0":
      return 0.0006 * output * KILO;
    case "gemma2-9b-it":
      return 0.2 * output;
    case "gemma-7b-it":
      return 0.07 * output;
    default:
      throw "Cannot find price info of the model";
  }
}

export function getBasePrice(model: string) {
  try {
    return `$${getInputTextPriceByModel(1, model).toFixed(
      2
    )} / 1M input tokens, $${getOutputTextPriceByModel(1, model).toFixed(
      2
    )} / 1M output tokens`;
  } catch {
    return "";
  }
}
