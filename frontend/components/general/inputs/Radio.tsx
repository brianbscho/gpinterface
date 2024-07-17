"use client";

import { textModels } from "gpinterface-shared/models/text/model";
import { Button } from "@radix-ui/themes";
import { imageModels } from "gpinterface-shared/models/image/model";
import { ModelType } from "@/hooks/useImageModel";

export const modals = ["None", "Text", "Image"];

function Radio<T extends string | number>({
  options,
  useOption,
  disabled,
  loading,
}: {
  options: T[];
  useOption: [T, (o: T) => void];
  disabled?: boolean;
  loading?: boolean;
}) {
  const [option, setOption] = useOption;
  return (
    <div className="flex flex-wrap items-center gap-3">
      {options.map((o, index) => (
        <Button
          key={`${o}_${index}`}
          onClick={() => setOption(o)}
          variant={o === option ? "soft" : "outline"}
          disabled={disabled}
          loading={loading}
        >
          {o}
        </Button>
      ))}
    </div>
  );
}

function RadioProvider({
  useProvider,
  disabled,
  loading,
}: {
  useProvider: [string, (a: string) => void];
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <Radio
      options={modals}
      useOption={useProvider}
      disabled={disabled}
      loading={loading}
    />
  );
}

function RadioTextProvider({
  useProvider,
  disabled,
  loading,
}: {
  useProvider: [string, (a: string) => void];
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <Radio
      options={textModels.map((m) => m.provider)}
      useOption={useProvider}
      disabled={disabled}
      loading={loading}
    />
  );
}

function RadioImageProvider({
  useProvider,
  disabled,
  loading,
}: {
  useProvider: [string, (a: string) => void];
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <Radio
      options={imageModels.map((m) => m.provider)}
      useOption={useProvider}
      disabled={disabled}
      loading={loading}
    />
  );
}

function RadioImageModel({
  models,
  useModel,
  disabled,
  loading,
}: {
  models: ModelType[];
  useModel: [ModelType | undefined, (o: ModelType | undefined) => void];
  disabled?: boolean;
  loading?: boolean;
}) {
  const [model, setModel] = useModel;
  return (
    <div className="flex flex-wrap items-center gap-3">
      {models.map((m) => (
        <Button
          key={m.name}
          onClick={() => setModel(m)}
          variant={m.name === model?.name ? "soft" : "outline"}
          disabled={disabled}
          loading={loading}
        >
          {m.name}
        </Button>
      ))}
    </div>
  );
}

Radio.Provider = RadioProvider;
Radio.TextProvider = RadioTextProvider;
Radio.ImageProvider = RadioImageProvider;
Radio.ImageModel = RadioImageModel;

export default Radio;
