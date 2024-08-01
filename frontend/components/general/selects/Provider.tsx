"use client";

import { textModels } from "gpinterface-shared/models/text/model";
import { imageModels } from "gpinterface-shared/models/image/model";
import { ModelType } from "@/hooks/useImageModel";
import Select from "./Select";

function TextProvider({
  useProvider,
  disabled,
}: {
  useProvider: [string, (a: string) => void];
  disabled?: boolean;
}) {
  return (
    <Select
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
    <Select
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
      options={models.map((m) => m.name)}
      useOption={[
        model.name,
        (v) => {
          const newModel = models.find((m) => m.name === v);
          if (!newModel) return;

          setModel(newModel);
        },
      ]}
      disabled={disabled}
    ></Select>
  );
}

const Provider = { TextProvider, ImageProvider, ImageModel };

export default Provider;
