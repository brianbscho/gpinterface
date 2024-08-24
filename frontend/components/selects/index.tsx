"use client";

import {
  Select as UiSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";

function Select({
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
    <UiSelect
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
    </UiSelect>
  );
}

export default Select;
