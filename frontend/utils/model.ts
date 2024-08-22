import { ConfigType } from "@/store/content";
import { Model } from "gpinterface-shared/type/providerType";

export const getApiConfig = (model: Model, config: ConfigType) => {
  const newConfig: {
    [key: string]: boolean | string | string[] | object | number;
  } = {};

  model.configs.forEach((c) => {
    if (!config[c.name] || config[c.name] === c.default) return;

    if (c.type === "boolean") {
      newConfig[c.name] = config[c.name] === "true";
    } else if (c.type === "object") {
      newConfig[c.name] = JSON.parse(config[c.name]);
    } else if (c.type === "array") {
      newConfig[c.name] = config[c.name].split(",");
    } else if (c.type === "integer" || c.type === "number") {
      newConfig[c.name] = Number(config[c.name]);
    } else {
      newConfig[c.name] = config[c.name];
    }
  });

  return newConfig;
};
