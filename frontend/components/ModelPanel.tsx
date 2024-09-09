import Model from "./Model";
import ModelSelect from "./selects/ModelSelect";
import ModelResetButton from "./buttons/ModelResetButton";
import { cn } from "@/utils/css";

type Props = { className?: string };
export default function ModelPanel({ className }: Props) {
  return (
    <div className={cn("h-full w-full relative overflow-y-auto", className)}>
      <div className="z-10 sticky top-0 w-full p-3 flex justify-end gap-1 md:gap-3 bg-background">
        <ModelSelect />
        <ModelResetButton />
      </div>
      <Model className="p-3 pt-0" />
    </div>
  );
}
