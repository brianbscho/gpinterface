"use client";

import { textModels } from "gpinterface-shared/models/text/model";
import { imageModels } from "gpinterface-shared/models/image/model";
import { ModelType } from "@/hooks/useImageModel";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";

function Provider({
  options,
  useOption,
  disabled,
}: {
  options: string[];
  useOption: [string, (o: string) => void];
  disabled?: boolean;
}) {
  const [option, setOption] = useOption;
  return (
    <Select
      value={option}
      onValueChange={(v) => setOption(v)}
      disabled={disabled}
    >
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o, index) => (
          <SelectItem key={`${o}_${index}`} value={o}>
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function TextProvider({
  useProvider,
  disabled,
}: {
  useProvider: [string, (a: string) => void];
  disabled?: boolean;
}) {
  return (
    <Provider
      options={textModels.map((m) => m.provider)}
      useOption={useProvider}
      disabled={disabled}
    />
  );
}

function ImageProvider({
  useProvider,
  disabled,
}: {
  useProvider: [string, (a: string) => void];
  disabled?: boolean;
}) {
  return (
    <Provider
      options={imageModels.map((m) => m.provider)}
      useOption={useProvider}
      disabled={disabled}
    />
  );
}

function ImageModel({
  models,
  useModel,
  disabled,
}: {
  models: ModelType[];
  useModel: [ModelType, (o: ModelType) => void];
  disabled?: boolean;
}) {
  const [model, setModel] = useModel;
  return (
    <Select
      value={model.name}
      onValueChange={(v) => {
        const newModel = models.find((m) => m.name === v);
        if (!newModel) return;

        setModel(newModel);
      }}
      disabled={disabled}
    >
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {models.map((m, index) => (
          <SelectItem key={`${m}_${index}`} value={m.name}>
            {m.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

Provider.TextProvider = TextProvider;
Provider.ImageProvider = ImageProvider;
Provider.ImageModel = ImageModel;

export default Provider;
